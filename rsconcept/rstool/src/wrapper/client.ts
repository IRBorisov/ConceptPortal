import { spawn, type ChildProcessByStdio } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
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
  /** Executable to spawn. Default: `npm`. Passed as argv, not a shell string. */
  command?: string;
  /** Arguments passed to `command`. Default: `['run', 'wrapper']`. */
  args?: string[];
  /** Working directory for the child process. Default: `process.cwd()`. */
  cwd?: string;
}

/**
 * Rewrite Windows npm/npx shims to `node <npm-cli.js>` so spawn() never needs a shell.
 * Node 20+ refuses to exec `.cmd` files without `shell: true` (CVE-2024-27980).
 */
function resolveSpawn(command: string, args: string[]): { command: string; args: string[] } {
  if (process.platform !== 'win32') {
    return { command, args };
  }
  const base = (command.replaceAll('\\', '/').split('/').pop() ?? command).toLowerCase();
  if (base === 'npm' || base === 'npm.cmd') {
    return { command: process.execPath, args: [bundledNpmBin('npm-cli.js'), ...args] };
  }
  if (base === 'npx' || base === 'npx.cmd') {
    return { command: process.execPath, args: [bundledNpmBin('npx-cli.js'), ...args] };
  }
  return { command, args };
}

function bundledNpmBin(bin: 'npm-cli.js' | 'npx-cli.js'): string {
  const cli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', bin);
  if (!existsSync(cli)) {
    throw new Error(`Cannot resolve ${bin} next to Node at ${process.execPath}`);
  }
  return cli;
}

/**
 * JSON-RPC client for the `rstool-wrapper` stdio process.
 *
 * Sends one JSON request per line on stdin and reads one JSON response per line from stdout.
 */
export class RSToolWrapperClient {
  private process: ChildProcessByStdio<Writable, Readable, null>;
  private input: readline.Interface;
  private pending = new Map<string, PendingCall>();
  private requestCounter = 1;
  /** Set once the child cannot start or has exited; every later request fails with this error. */
  private failure: Error | null = null;
  private closing = false;

  /**
   * @param options - Spawn configuration; defaults run `npm run wrapper` in the current directory.
   */
  public constructor(options: RSToolWrapperClientOptions = {}) {
    const resolved = resolveSpawn(options.command ?? 'npm', options.args ?? ['run', 'wrapper']);
    this.process = spawn(resolved.command, resolved.args, {
      cwd: options.cwd ?? process.cwd(),
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'inherit']
    });
    this.input = readline.createInterface({
      input: this.process.stdout,
      crlfDelay: Infinity
    });
    this.input.on('line', line => this.handleLine(line));

    // Without these listeners a failed spawn (ENOENT, EACCES) or a broken stdin pipe
    // surfaces as an uncaught exception instead of a rejected promise.
    this.process.on('error', error => this.fail(error));
    this.process.stdin.on('error', error => this.fail(error));
    this.process.on('exit', (code, signal) => {
      if (this.closing) {
        this.fail(new Error('Wrapper closed'));
        return;
      }
      this.fail(new Error(`Wrapper exited before responding (code ${code ?? 'null'}, signal ${signal ?? 'null'})`));
    });
  }

  /**
   * Block until the wrapper emits its initial `{ ready: true }` event.
   *
   * @throws When the wrapper process cannot be started or exits before becoming ready.
   */
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
   * @throws When the wrapper responds with `ok: false`, cannot be started, or exits before responding.
   */
  public async call<T>(method: string, params: unknown = {}): Promise<T> {
    if (this.failure) {
      throw this.failure;
    }
    const id = String(this.requestCounter++);
    const payload = JSON.stringify({ id, method, params });
    const responsePromise = new Promise<WrapperResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
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
    this.closing = true;
    this.input.close();
    if (!this.process.stdin.destroyed) {
      this.process.stdin.end();
    }
    if (this.process.exitCode === null && !this.process.killed) {
      this.process.kill();
    }
  }

  private async readOneEvent(): Promise<string> {
    if (this.failure) {
      throw this.failure;
    }
    return new Promise((resolve, reject) => {
      const onLine = (line: string) => {
        cleanup();
        resolve(line);
      };
      const onExit = () => {
        cleanup();
        reject(this.failure ?? new Error('Wrapper exited before ready'));
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const cleanup = () => {
        this.input.off('line', onLine);
        this.process.off('exit', onExit);
        this.process.off('error', onError);
      };
      this.input.on('line', onLine);
      this.process.on('exit', onExit);
      this.process.on('error', onError);
    });
  }

  /** Records the terminal failure and rejects every outstanding request. */
  private fail(error: Error): void {
    if (this.failure) {
      return;
    }
    this.failure = error;
    const outstanding = [...this.pending.values()];
    this.pending.clear();
    for (const entry of outstanding) {
      entry.reject(error);
    }
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
    const entry = this.pending.get(id);
    if (!entry) {
      return;
    }
    this.pending.delete(id);
    entry.resolve(parsed);
  }
}

interface PendingCall {
  resolve: (value: WrapperResponse) => void;
  reject: (reason: Error) => void;
}
