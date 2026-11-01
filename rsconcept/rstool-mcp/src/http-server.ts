import { createHash, randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { RSToolAgent } from '@rsconcept/rstool';

import { type VerifyHttpToken } from './http-auth';
import { buildRSToolMcpServer } from './server';

export interface RSToolHttpServerOptions {
  /** Durable root, exclusively owned by this single service process. */
  persistenceDir: string;
  /** Must verify the credential and return a stable identity, or null. Called on every request. */
  verifyToken: VerifyHttpToken;
  /** Hostnames without ports. Forwarded headers are intentionally ignored. */
  allowedHosts?: readonly string[];
  /** Requests with an Origin header are rejected unless explicitly allowed. No CORS is enabled. */
  allowedOrigins?: readonly string[];
  maxSessions?: number;
  idleTimeoutMs?: number;
  maxRequestBodySize?: number;
  maxPendingRequests?: number;
}

interface HttpSession {
  namespace: string;
  server: ReturnType<typeof buildRSToolMcpServer>;
  transport: StreamableHTTPServerTransport;
  tail: Promise<void>;
  pending: number;
  lastUsed: number;
  closed: boolean;
}

export interface RSToolHttpService {
  server: Server;
  /** Stop accepting requests, drain pending requests, then release all session resources. */
  close: () => Promise<void>;
}

/** Stateful Streamable HTTP with one exclusive, persisted workspace per identity and task. */
export function createRSToolHttpServer(options: RSToolHttpServerOptions): RSToolHttpService {
  if (!options.persistenceDir || typeof options.verifyToken !== 'function') {
    throw new Error('HTTP requires persistenceDir and verifyToken');
  }
  const maxSessions = positiveInteger(options.maxSessions ?? 32, 'maxSessions');
  const idleTimeoutMs = positiveInteger(options.idleTimeoutMs ?? 30 * 60_000, 'idleTimeoutMs');
  const maxRequestBodySize = positiveInteger(options.maxRequestBodySize ?? 4 * 1024 * 1024, 'maxRequestBodySize');
  const maxPendingRequests = positiveInteger(options.maxPendingRequests ?? 8, 'maxPendingRequests');
  const allowedHosts = new Set(options.allowedHosts ?? ['127.0.0.1', 'localhost', '[::1]']);
  const allowedOrigins = new Set(options.allowedOrigins ?? []);
  const workspaces = new Map<string, HttpSession>();
  const sessions = new Map<string, HttpSession>();
  let closing: Promise<void> | undefined;
  let stopped = false;

  function forget(entry: HttpSession): void {
    entry.closed = true;
    if (workspaces.get(entry.namespace) === entry) workspaces.delete(entry.namespace);
    if (entry.transport.sessionId) sessions.delete(entry.transport.sessionId);
  }

  async function dispose(entry: HttpSession): Promise<void> {
    forget(entry);
    await entry.server.close();
  }

  function expireIdleSessions(): void {
    const cutoff = Date.now() - idleTimeoutMs;
    for (const entry of workspaces.values()) {
      if (entry.pending === 0 && entry.lastUsed <= cutoff) {
        // close() only releases transport resources; session data stays on disk.
        void dispose(entry).catch(() => undefined);
      }
    }
  }

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    response.setHeader('Cache-Control', 'no-store');
    if (stopped) return reject(response, 503, 'Service is stopping');
    let url: URL;
    try {
      url = new URL(request.url ?? '/', `http://${request.headers.host ?? ''}`);
      if (!allowedHosts.has(new URL(`http://${request.headers.host}`).hostname)) {
        return reject(response, 403, 'Host is not allowed');
      }
    } catch {
      return reject(response, 400, 'Invalid request URL or Host');
    }
    const origin = request.headers.origin;
    if (origin !== undefined && !allowedOrigins.has(origin)) {
      return reject(response, 403, 'Origin is not allowed');
    }
    const route = /^\/mcp(?:\/([A-Za-z0-9][A-Za-z0-9._-]{0,63}))?\/?$/.exec(url.pathname);
    if (!route) return reject(response, 404, 'Not found');
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '')?.[1];
    const subject = token ? await options.verifyToken(token) : null;
    if (!subject || typeof subject !== 'string') {
      response.setHeader('WWW-Authenticate', 'Bearer realm="rstool-mcp"');
      return reject(response, 401, 'Bearer authentication required');
    }
    if (request.method !== 'POST' && request.method !== 'DELETE') {
      response.setHeader('Allow', 'POST, DELETE');
      return reject(response, 405, 'Only POST and DELETE are supported');
    }
    // A hash prevents subjects or workspace names from becoming filesystem paths.
    const namespace = createHash('sha256').update(JSON.stringify([subject, route[1] ?? 'default'])).digest('hex');
    const sessionId = request.headers['mcp-session-id'];
    let entry: HttpSession;
    if (sessionId !== undefined) {
      const found = typeof sessionId === 'string' ? sessions.get(sessionId) : undefined;
      if (!found || found.namespace !== namespace || found.closed) {
        return reject(response, 404, 'Session not found');
      }
      entry = found;
    } else {
      if (request.method !== 'POST') return reject(response, 400, 'Mcp-Session-Id is required');
      expireIdleSessions();
      if (workspaces.has(namespace)) return reject(response, 409, 'Workspace already has an active MCP session');
      if (workspaces.size >= maxSessions) return reject(response, 503, 'Active session limit reached');
      const tool = new RSToolAgent({ persistenceDir: join(options.persistenceDir, namespace) });
      const mcpServer = buildRSToolMcpServer({ tool, serializeToolCalls: true });
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: randomUUID,
        enableJsonResponse: true,
        maxRequestBodySize,
        onsessioninitialized: id => { sessions.set(id, entry); },
      });
      entry = {
        namespace, server: mcpServer, transport,
        tail: Promise.resolve(), pending: 0, lastUsed: Date.now(), closed: false,
      };
      // Reserve before the first await, including simultaneous initialize requests.
      workspaces.set(namespace, entry);
      mcpServer.server.onclose = () => forget(entry);
      try {
        await mcpServer.connect(transport);
      } catch (error) {
        await dispose(entry);
        throw error;
      }
    }
    if (entry.pending >= maxPendingRequests) return reject(response, 429, 'Workspace request queue is full');
    entry.pending++;
    // rstool has a mutable current session. Serialize calls within each workspace.
    const task = entry.tail.then(async () => {
      if (entry.closed) return reject(response, 404, 'Session not found');
      await entry.transport.handleRequest(request, response);
    });
    entry.tail = task.catch(() => undefined);
    try {
      await task;
    } finally {
      entry.pending--;
      entry.lastUsed = Date.now();
      // Invalid/oversized initialization must not consume a workspace lease.
      if (!entry.transport.sessionId) await dispose(entry);
    }
  }

  const server = createServer((request, response) => {
    void handle(request, response).catch(() => {
      // Do not leak credentials, payloads or filesystem paths to clients/logs.
      if (!response.headersSent) reject(response, 500, 'Internal server error');
      else response.end();
    });
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  const timer = setInterval(expireIdleSessions, Math.min(idleTimeoutMs, 60_000));
  timer.unref();

  return {
    server,
    close: () => {
      closing ??= (async () => {
        stopped = true;
        clearInterval(timer);
        if (server.listening) {
          await new Promise<void>((resolve, rejectClose) => server.close(error => error ? rejectClose(error) : resolve()));
        }
        await Promise.all([...workspaces.values()].map(dispose));
      })();
      return closing;
    },
  };
}

function reject(response: ServerResponse, status: number, message: string): void {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: message }));
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`);
  return value;
}
