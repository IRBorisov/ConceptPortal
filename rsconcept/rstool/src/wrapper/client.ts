import { spawn, type ChildProcessByStdio } from 'node:child_process';
import readline from 'node:readline';
import { type Readable, type Writable } from 'node:stream';

/** One JSON line emitted by the stdio wrapper (request response or ready event). */
export interface WrapperResponse<T = unknown> {
  id: string | number | null;
  ok: boolean;
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Options for spawning the `rstool-wrapper` child process. */
export interface RSToolWrapperClientOptions {
  /** Executable to spawn. Default: `npm`. */
  command?: string;
  /** Arguments passed to `command`. Default: `['run', 'wrapper']`. */
  args?: string[];
  /** Working directory for the child process. Default: `process.cwd()`. */
  cwd?: string;
  /** Whether to run the command in a shell. Default: `true`. */
  shell?: boolean;
}

/**
 * JSON-RPC client for the `rstool-wrapper` stdio process.
 *
 * Sends one JSON request per line on stdin and reads one JSON response per line from stdout.
 */
export class RSToolWrapperClient {
  private process: ChildProcessByStdio<Writable, Readable, null>;
  private input: readline.Interface;
  private pending = new Map<string, (value: WrapperResponse) => void>();
  private requestCounter = 1;

  /**
   * @param options - Spawn configuration; defaults run `npm run wrapper` in the current directory.
   */
  public constructor(options: RSToolWrapperClientOptions = {}) {
    this.process = spawn(options.command ?? 'npm', options.args ?? ['run', 'wrapper'], {
      cwd: options.cwd ?? process.cwd(),
      shell: options.shell ?? true,
      stdio: ['pipe', 'pipe', 'inherit']
    });
    this.input = readline.createInterface({
      input: this.process.stdout,
      crlfDelay: Infinity
    });
    this.input.on('line', line => this.handleLine(line));
  }

  /** Block until the wrapper emits its initial `{ ready: true }` event. */
  public async waitUntilReady(): Promise<void> {
    for (;;) {
      const line = await this.readOneEvent();
      let response: WrapperResponse<{ ready: boolean }> | null = null;
      try {
        response = JSON.parse(line) as WrapperResponse<{ ready: boolean }>;
      } catch {
        continue;
      }
      if (response.ok && response.result?.ready) {
        return;
      }
    }
  }

  /**
   * Invoke a wrapper method and return its `result` field.
   *
   * @param method - Stdio method name (matches {@link RSToolAgentContract} operations).
   * @param params - Method parameters object.
   * @throws When the wrapper responds with `ok: false`.
   */
  public async call<T>(method: string, params: unknown = {}): Promise<T> {
    const id = String(this.requestCounter++);
    const payload = JSON.stringify({ id, method, params });
    const responsePromise = new Promise<WrapperResponse>(resolve => {
      this.pending.set(id, resolve);
    });
    this.process.stdin.write(`${payload}\n`);
    const response = await responsePromise;
    if (!response.ok) {
      throw new Error(`${response.error?.code ?? 'UNKNOWN'}: ${response.error?.message ?? 'Request failed'}`);
    }
    return response.result as T;
  }

  /** Close stdin and terminate the wrapper process. */
  public async close(): Promise<void> {
    this.input.close();
    this.process.stdin.end();
    if (!this.process.killed) {
      this.process.kill();
    }
  }

  private async readOneEvent(): Promise<string> {
    return new Promise((resolve, reject) => {
      const onLine = (line: string) => {
        cleanup();
        resolve(line);
      };
      const onExit = () => {
        cleanup();
        reject(new Error('Wrapper exited before ready'));
      };
      const cleanup = () => {
        this.input.off('line', onLine);
        this.process.off('exit', onExit);
      };
      this.input.on('line', onLine);
      this.process.on('exit', onExit);
    });
  }

  private handleLine(line: string): void {
    let parsed: WrapperResponse;
    try {
      parsed = JSON.parse(line) as WrapperResponse;
    } catch {
      return;
    }
    if (parsed.id === null || parsed.id === undefined) {
      return;
    }
    const id = String(parsed.id);
    const resolver = this.pending.get(id);
    if (!resolver) {
      return;
    }
    this.pending.delete(id);
    resolver(parsed);
  }
}
