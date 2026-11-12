import { fork, type ChildProcess } from 'node:child_process';

import { RSToolError } from '@rsconcept/rstool';
import { HostedRSToolAgent, type ExecutionSnapshot } from '@rsconcept/rstool/hosting';

import { SessionStorageError } from './session-policy';

export const COMPUTE_TOOLS = new Set(['apply_schema_patch', 'analyze_expression', 'import_data',
  'set_model_values', 'evaluate', 'recalculate_model', 'restore_order', 'synthesize']);

interface ComputeOptions {
  maxWorkers?: number;
  timeoutMs?: number;
  heapMb?: number;
  maxSessionBytes?: number;
  maxResultBytes?: number;
  /** Trusted test/embedding configuration, never a remote tool argument. */
  workerUrl?: URL;
}

interface Reply { ok: boolean; result?: unknown; snapshot?: ExecutionSnapshot; error?: { code?: string; message?: string } }
interface RunningJob { child: ChildProcess; done: Promise<Reply>; cancel: () => void }

/** Bound parallel work and kill a disposable process before accepting its detached result. */
export class ComputePool {
  private readonly options: Required<ComputeOptions>;
  private readonly jobs = new Set<RunningJob>();
  private running = 0;
  private stopping = false;

  constructor(options: ComputeOptions = {}) {
    this.options = { maxWorkers: options.maxWorkers ?? 2, timeoutMs: options.timeoutMs ?? 10_000,
      heapMb: options.heapMb ?? 128, maxSessionBytes: options.maxSessionBytes ?? 2 * 1024 * 1024,
      maxResultBytes: options.maxResultBytes ?? 4 * 1024 * 1024,
      workerUrl: options.workerUrl ?? (import.meta.url.endsWith('.ts') ? new URL('./compute-worker.ts', import.meta.url) : new URL(import.meta.resolve('@rsconcept/rstool-mcp/compute-worker'))) };
    for (const [name, value] of Object.entries(this.options)) {
      if (name !== 'workerUrl' && (!Number.isSafeInteger(value) || Number(value) <= 0)) throw new Error('Invalid computation limit');
    }
    if (this.options.timeoutMs > 2147483647) throw new Error('Computation timeout exceeds the timer range');
  }

  async execute(agent: HostedRSToolAgent, name: string, args: Record<string, unknown>,
    signal?: AbortSignal, mayCommit: () => boolean = () => true): Promise<unknown> {
    if (this.stopping) throw new SessionStorageError('COMPUTE_STOPPING', 'Computation service is stopping.');
    if (this.running >= this.options.maxWorkers) throw new SessionStorageError('COMPUTE_CAPACITY_REACHED',
      'Computation capacity reached. This invocation did not change the model.', { retryAfterSeconds: 1 });
    if (!COMPUTE_TOOLS.has(name)) throw new Error('Tool is not a detached computation');
    if (signal?.aborted) throw new SessionStorageError('COMPUTE_CANCELLED', 'Computation was cancelled before execution.');
    this.running++;
    try {
      const required = ['sessionId', 'sourceSessionId'].flatMap(key => typeof args[key] === 'string' ? [args[key] as string] : []);
      const optional: string[] = [];
      const initial = args.initial as { sessionId?: unknown } | undefined;
      if (typeof initial?.sessionId === 'string') optional.push(initial.sessionId);
      if (name === 'import_data') {
        const payload = typeof args.payload === 'string' ? JSON.parse(args.payload) : args.payload;
        if (typeof payload?.state?.sessionId === 'string') optional.push(payload.state.sessionId);
      }
      const base = agent.captureExecutionState(required, optional, typeof args.sessionId !== 'string' && name !== 'import_data');
      const job = this.start({ name, args, snapshot: base, maxSessionBytes: this.options.maxSessionBytes,
        maxResultBytes: this.options.maxResultBytes }, signal);
      this.jobs.add(job);
      let reply: Reply;
      try { reply = await job.done; } finally { this.jobs.delete(job); }
      if (!mayCommit() || signal?.aborted || this.stopping) throw new SessionStorageError('COMPUTE_CANCELLED',
        'Computation result was discarded after the connection closed.');
      if (!reply.ok) {
        const code = reply.error?.code;
        const message = reply.error?.message ?? 'Computation failed';
        if (code === 'NO_CURRENT_SESSION' || code === 'SESSION_NOT_FOUND' || code === 'INVALID_EVALUATE_ARGUMENTS') {
          throw new RSToolError(code, message);
        }
        if (code === 'SESSION_TOO_LARGE' || code === 'COMPUTE_RESULT_TOO_LARGE') throw new SessionStorageError(code, message);
        throw new Error(message);
      }
      if (!reply.snapshot) throw new Error('Computation returned no snapshot');
      agent.commitExecutionState(base, reply.snapshot);
      return reply.result;
    } finally {
      agent.trimExecutionCache();
      this.running--;
    }
  }

  async close(): Promise<void> {
    this.stopping = true;
    for (const job of this.jobs) job.cancel();
    await Promise.allSettled([...this.jobs].map(job => job.done));
  }

  private start(payload: Record<string, unknown>, signal?: AbortSignal): RunningJob {
    const options = this.options;
    const env: NodeJS.ProcessEnv = {};
    for (const name of ['PATH', 'SystemRoot', 'TEMP', 'TMP', 'LANG', 'LC_ALL']) if (process.env[name]) env[name] = process.env[name];
    const execArgv = [`--max-old-space-size=${options.heapMb}`, '--stack-size=4096'];
    if (options.workerUrl.pathname.endsWith('.ts')) execArgv.push('--import', import.meta.resolve('tsx'));
    const child = fork(options.workerUrl, [], { execArgv, env, serialization: 'advanced', stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
    child.stdout?.resume();
    child.stderr?.resume();
    let cancel = () => {};
    const done = new Promise<Reply>((resolve, reject) => {
      let reply: Reply | undefined;
      let failure: Error | undefined;
      const terminate = (error: Error) => { failure ??= error; child.kill('SIGKILL'); };
      cancel = () => terminate(new SessionStorageError('COMPUTE_CANCELLED', 'Computation was stopped without committing a result.'));
      const aborted = () => cancel();
      const timer = setTimeout(() => terminate(new SessionStorageError('COMPUTE_TIMEOUT',
        'Computation exceeded its time budget. The model was not changed.')), options.timeoutMs);
      signal?.addEventListener('abort', aborted, { once: true });
      child.once('message', (message: Reply) => { reply = message; child.kill('SIGKILL'); });
      child.once('error', () => terminate(new SessionStorageError('COMPUTE_PROCESS_FAILED', 'Computation process could not run.')));
      child.once('close', () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', aborted);
        if (failure) reject(failure);
        else if (!reply || typeof reply.ok !== 'boolean') reject(new SessionStorageError('COMPUTE_RESOURCE_LIMIT',
          'Computation process stopped before returning a result. The model was not changed.'));
        else resolve(reply);
      });
      try { child.send(payload); } catch { terminate(new SessionStorageError('COMPUTE_PROCESS_FAILED', 'Computation input could not be transferred.')); }
    });
    return { child, done, cancel: () => cancel() };
  }
}
