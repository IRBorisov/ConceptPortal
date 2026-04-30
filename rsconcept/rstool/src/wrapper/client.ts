import { spawn, type ChildProcessByStdio } from "node:child_process";
import readline from "node:readline";
import { type Readable, type Writable } from "node:stream";

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

export interface RSToolWrapperClientOptions {
  command?: string;
  args?: string[];
  cwd?: string;
  shell?: boolean;
}

export class RSToolWrapperClient {
  private process: ChildProcessByStdio<Writable, Readable, null>;
  private input: readline.Interface;
  private pending = new Map<string, (value: WrapperResponse) => void>();
  private requestCounter = 1;

  public constructor(options: RSToolWrapperClientOptions = {}) {
    this.process = spawn(
      options.command ?? "npm",
      options.args ?? ["run", "wrapper"],
      {
        cwd: options.cwd ?? process.cwd(),
        shell: options.shell ?? true,
        stdio: ["pipe", "pipe", "inherit"],
      },
    );
    this.input = readline.createInterface({
      input: this.process.stdout,
      crlfDelay: Infinity,
    });
    this.input.on("line", (line) => this.handleLine(line));
  }

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

  public async call<T>(method: string, params: unknown = {}): Promise<T> {
    const id = String(this.requestCounter++);
    const payload = JSON.stringify({ id, method, params });
    const responsePromise = new Promise<WrapperResponse>((resolve) => {
      this.pending.set(id, resolve);
    });
    this.process.stdin.write(`${payload}\n`);
    const response = await responsePromise;
    if (!response.ok) {
      throw new Error(
        `${response.error?.code ?? "UNKNOWN"}: ${response.error?.message ?? "Request failed"}`,
      );
    }
    return response.result as T;
  }

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
        reject(new Error("Wrapper exited before ready"));
      };
      const cleanup = () => {
        this.input.off("line", onLine);
        this.process.off("exit", onExit);
      };
      this.input.on("line", onLine);
      this.process.on("exit", onExit);
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
