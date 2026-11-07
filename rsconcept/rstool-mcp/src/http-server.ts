import { createHash, randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { RSToolAgent } from '@rsconcept/rstool';

import { type VerifyHttpToken } from './http-auth';
import { SessionPolicy, SessionStorageError } from './session-policy';
import { buildRSToolMcpServer } from './server';
import { handlePortalAccount, servePortalAccount } from './portal-account';
import type { PortalPublisher } from './portal-publisher';
import { portalToolDefinitions, sessionStorageToolDefinitions } from './tools';

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
  /** Durable session count across all workspaces belonging to one authenticated account. */
  maxStoredSessionsPerAccount?: number;
  /** Inactivity duration, renewed by successful session access rather than HTTP keep-alives. */
  sessionRetentionMs?: number;
  /** Sweep cadence; persisted access checks also enforce expiry immediately. */
  sessionCleanupIntervalMs?: number;
  idleTimeoutMs?: number;
  maxRequestBodySize?: number;
  maxPendingRequests?: number;
  /** Wall-clock HTTP deadline; a timed-out lease drains before it can be reused. */
  requestTimeoutMs?: number;
  /** Deadline for an asynchronous credential verifier. */
  authenticationTimeoutMs?: number;
  /** Optional fixed-origin integration; account APIs and Portal tools exist only when configured. */
  portal?: { publisher: PortalPublisher; publicOrigin: string; verifyAccountToken: VerifyHttpToken };
}

interface HttpSession {
  subject: string;
  namespace: string;
  server: ReturnType<typeof buildRSToolMcpServer>;
  transport: StreamableHTTPServerTransport;
  tail: Promise<void>;
  pending: number;
  lastUsed: number;
  closed: boolean;
  activeTools: number;
  revision: string;
  responses: Set<ServerResponse>;
  disposal?: Promise<void>;
  drained: Promise<void>;
  resolveDrained: () => void;
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
  const authenticationTimeoutMs = positiveInteger(options.authenticationTimeoutMs ?? 5_000, 'authenticationTimeoutMs');
  const requestTimeoutMs = positiveInteger(options.requestTimeoutMs ?? 120_000, 'requestTimeoutMs');
  const allowedHosts = new Set((options.allowedHosts ?? ['127.0.0.1', 'localhost', '[::1]']).map(host => host.toLowerCase()));
  const allowedOrigins = new Set(options.allowedOrigins ?? []);
  if (options.portal) {
    if (typeof options.portal.verifyAccountToken !== 'function' || options.portal.verifyAccountToken === options.verifyToken) throw new Error('Portal account access requires an independent credential verifier');
    const origin = new URL(options.portal.publicOrigin);
    if (origin.protocol !== 'https:' || origin.origin !== options.portal.publicOrigin) throw new Error('Portal account page requires an HTTPS public origin');
    allowedOrigins.add(origin.origin);
  }
  const workspaces = new Map<string, HttpSession>();
  const sessions = new Map<string, HttpSession>();
  const policy = new SessionPolicy(options.persistenceDir, options.maxStoredSessionsPerAccount,
    options.sessionRetentionMs, () => Date.now(), namespace => {
      const entry = workspaces.get(namespace);
      if (entry) options.portal?.publisher.invalidateWorkspace(entry.subject, namespace);
    });
  const cleanupIntervalMs = positiveInteger(options.sessionCleanupIntervalMs ?? 60_000, 'sessionCleanupIntervalMs');
  let closing: Promise<void> | undefined;
  let stopped = false;

  /** Release ownership only after actual tool work and HTTP handlers have settled. */
  function releaseDrained(entry: HttpSession): void {
    if (!entry.closed || entry.activeTools || entry.pending) return;
    if (workspaces.get(entry.namespace) === entry) {
      policy.release(entry.namespace);
      workspaces.delete(entry.namespace);
    }
    pruneClosed(entry);
    entry.resolveDrained();
  }

  /** Stop queued work immediately, while retaining the workspace lock for running operations. */
  function drain(entry: HttpSession, destroyResponses = false): void {
    if (!entry.closed) {
      entry.closed = true;
      entry.revision = randomUUID();
      options.portal?.publisher.invalidateWorkspace(entry.subject, entry.namespace);
      if (entry.transport.sessionId) sessions.delete(entry.transport.sessionId);
    }
    if (destroyResponses) for (const response of entry.responses) if (!response.writableFinished) response.destroy();
    releaseDrained(entry);
  }

  /** Closing the MCP transport cannot cancel an already running asynchronous mutation. */
  async function dispose(entry: HttpSession): Promise<void> {
    drain(entry, true);
    entry.disposal ??= entry.server.close();
    await entry.disposal;
    releaseDrained(entry);
  }

  /** Invalid initialization and closed empty leases must not accumulate permanent directories. */
  function pruneClosed(entry: HttpSession): void {
    if (!entry.closed || entry.pending !== 0) return;
    try { policy.pruneEmpty(entry.namespace); }
    catch { process.stderr.write('rstool-mcp empty workspace cleanup pending\n'); }
  }

  /** Reclaim inactive leases while leaving queued and in-flight requests untouched. */
  function expireIdleSessions(): void {
    const cutoff = Date.now() - idleTimeoutMs;
    for (const entry of workspaces.values()) {
      if (!entry.closed && entry.pending === 0 && entry.activeTools === 0 && entry.lastUsed <= cutoff) {
        // close() only releases transport resources; session data stays on disk.
        void dispose(entry).catch(() => undefined);
      }
    }
  }

  /** Validate the caller and route each request to its identity/task-owned transport. */
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
    if (options.portal && servePortalAccount(url.pathname, request, response)) return;
    const accountRoute = options.portal && url.pathname.startsWith('/portal/api/');
    const management = /^\/mcp\/([A-Za-z0-9][A-Za-z0-9._-]{0,63})\/connection\/?$/.exec(url.pathname);
    const route = management ?? /^\/mcp(?:\/([A-Za-z0-9][A-Za-z0-9._-]{0,63}))?\/?$/.exec(url.pathname);
    if (!route && !accountRoute) return reject(response, 404, 'Not found');
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '')?.[1];
    const verifier = accountRoute && options.portal ? options.portal.verifyAccountToken : options.verifyToken;
    const subject = token ? await verifyWithDeadline(verifier, token, authenticationTimeoutMs) : null;
    if (subject === AUTHENTICATION_TIMEOUT) return reject(response, 503, 'Authentication timed out');
    if (!subject || typeof subject !== 'string') {
      response.setHeader('WWW-Authenticate', 'Bearer realm="rstool-mcp"');
      return reject(response, 401, 'Bearer authentication required');
    }
    if (accountRoute && options.portal) {
      await handlePortalAccount(url.pathname, request, response, subject, options.portal.publisher, options.portal.publicOrigin);
      return;
    }
    if (!route) return reject(response, 404, 'Not found');
    // A hash prevents subjects and workspace names from becoming filesystem paths.
    const namespace = createHash('sha256').update(JSON.stringify([subject, route[1] ?? 'default'])).digest('hex');
    if (management) {
      // No request body is accepted, including chunked bodies. Reads never renew the lease.
      if (request.headers['transfer-encoding'] || (request.headers['content-length'] && request.headers['content-length'] !== '0'))
        return reject(response, 400, 'Connection management accepts no body');
      const lease = workspaces.get(namespace);
      if (request.method === 'GET') {
        if (lease) response.setHeader('ETag', `"${lease.revision}"`);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(lease ? { state: lease.closed ? 'draining' : 'connected',
          busy: lease.pending > 0 || lease.activeTools > 0, idleSeconds: Math.max(0, (Date.now() - lease.lastUsed) / 1000) }
          : { state: 'disconnected', busy: false }));
        return;
      }
      if (request.method !== 'DELETE') {
        response.setHeader('Allow', 'GET, DELETE');
        return reject(response, 405, 'Only GET and DELETE are supported');
      }
      if (!lease) return reject(response, 404, 'Connection not found');
      if (request.headers['if-match'] !== `"${lease.revision}"`)
        return reject(response, 409, 'Connection changed; read its current ETag');
      if (lease.closed || lease.pending || lease.activeTools)
        return reject(response, 409, 'Connection is busy or draining');
      // Explicit compare-and-release. Initialization itself never takes over another lease.
      await dispose(lease);
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method !== 'POST' && request.method !== 'DELETE') {
      response.setHeader('Allow', 'POST, DELETE');
      return reject(response, 405, 'Only POST and DELETE are supported');
    }
    const sessionId = request.headers['mcp-session-id'];
    let entry: HttpSession;
    let initializationResponse: Promise<boolean> | undefined;
    if (sessionId !== undefined) {
      const found = typeof sessionId === 'string' ? sessions.get(sessionId) : undefined;
      if (!found || found.namespace !== namespace || found.closed) {
        return reject(response, 404, 'Session not found');
      }
      entry = found;
    } else {
      if (request.method !== 'POST') return reject(response, 400, 'Mcp-Session-Id is required');
      expireIdleSessions();
      if (workspaces.has(namespace)) return reject(response, 409, 'Workspace has an active or draining connection; inspect its /connection endpoint');
      if (workspaces.size >= maxSessions) return reject(response, 503, 'Active session limit reached');
      initializationResponse = responseCompletion(response);
      policy.register(subject, namespace, route[1] ?? 'default');
      const tool = new RSToolAgent({ persistenceDir: join(options.persistenceDir, namespace),
        sessionLifecycle: policy.hooks(subject, namespace) });
      const mcpServer = buildRSToolMcpServer({ tool, serializeToolCalls: true, sanitizeStorageErrors: true,
        instructions: `Max ${policy.limit} stored sessions per account across workspaces; inactivity TTL ${policy.retentionMs / 1000} seconds. Call get_session_storage_config for limits and usage. At SESSION_LIMIT_REACHED use list_stored_sessions and reuse or explicitly delete an unneeded session with delete_stored_session. Deletion is destructive; follow user/client approval policy. No automatic victim selection. Listing never renews TTL.`,
        aroundToolCall: async (invoke, definition) => {
          if (entry.closed) throw new Error('Workspace connection is draining');
          entry.activeTools++;
          entry.revision = randomUUID();
          let release: (() => void) | undefined;
          try {
            if (definition?.sessionActivity !== 'none') release = policy.begin(namespace);
            return await invoke();
          } finally {
            try { release?.(); }
            finally {
              entry.activeTools--;
              entry.lastUsed = Date.now();
              entry.revision = randomUUID();
              releaseDrained(entry);
            }
          }
        },
        additionalTools: [
          ...sessionStorageToolDefinitions(policy, subject, namespace, { cleanupIntervalMs, maxActiveSessions: maxSessions,
            idleTimeoutMs, maxPendingRequests, maxRequestBodySize }),
          ...(options.portal ? portalToolDefinitions(options.portal.publisher, subject, namespace,
            id => policy.assertRetained(namespace, id)) : [])
        ] });
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: randomUUID,
        enableJsonResponse: true,
        maxRequestBodySize,
        onsessioninitialized: id => { sessions.set(id, entry); },
      });
      let resolveDrained!: () => void;
      const drained = new Promise<void>(resolve => { resolveDrained = resolve; });
      entry = {
        subject, namespace, server: mcpServer, transport,
        tail: Promise.resolve(), pending: 0, lastUsed: Date.now(), closed: false,
        activeTools: 0, revision: randomUUID(), responses: new Set(), drained, resolveDrained,
      };
      // Reserve before the first await, including simultaneous initialize requests.
      workspaces.set(namespace, entry);
      mcpServer.server.onclose = () => drain(entry);
      try {
        await mcpServer.connect(transport);
      } catch (error) {
        await dispose(entry);
        throw error;
      }
    }
    if (entry.pending >= maxPendingRequests) return reject(response, 429, 'Workspace request queue is full');
    entry.pending++;
    entry.revision = randomUUID();
    entry.responses.add(response);
    const completion = responseCompletion(response);
    const onClose = () => {
      if (!response.writableFinished) void dispose(entry).catch(() => undefined);
    };
    response.once('close', onClose);
    const deadline = setTimeout(() => { void dispose(entry).catch(() => undefined); }, requestTimeoutMs);
    deadline.unref();
    // rstool has a mutable current session. Serialize calls within each workspace.
    const task = entry.tail.then(async () => {
      if (entry.closed) return reject(response, 404, 'Session not found');
      await Promise.race([entry.transport.handleRequest(request, response), completion]);
    });
    entry.tail = task.catch(() => undefined);
    let handled = false;
    try {
      await task;
      await completion;
      handled = true;
    } finally {
      if (initializationResponse) {
        // A thrown handler must not leave completion waiting for the outer error response.
        if (!handled) response.destroy();
        const delivered = await initializationResponse;
        if (!entry.transport.sessionId || !delivered) await dispose(entry);
      }
      clearTimeout(deadline);
      response.off('close', onClose);
      entry.responses.delete(response);
      entry.pending--;
      entry.lastUsed = Date.now();
      entry.revision = randomUUID();
      releaseDrained(entry);
    }
  }

  const server = createServer((request, response) => {
    response.once('finish', () => {
      // Requests active when close() began may only now have become idle.
      if (stopped) server.closeIdleConnections();
    });
    void handle(request, response).catch((error: unknown) => {
      // Do not leak credentials, payloads or filesystem paths to clients/logs.
      if (response.destroyed) return;
      if (!response.headersSent) reject(response, error instanceof SessionStorageError ? 503 : 500,
        error instanceof SessionStorageError ? error.code : 'Internal server error');
      else response.end();
    });
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  const timer = setInterval(expireIdleSessions, Math.min(idleTimeoutMs, 60_000));
  timer.unref();
  const cleanupTimer = setInterval(() => {
    try {
      const failures = policy.sweep();
      if (failures.size) process.stderr.write(`rstool-mcp session cleanup failed for ${failures.size} workspace(s)\n`);
    } catch { process.stderr.write('rstool-mcp session cleanup failed\n'); }
  }, cleanupIntervalMs);
  cleanupTimer.unref();

  return {
    server,
    close: () => {
      closing ??= (async () => {
        stopped = true;
        clearInterval(timer);
        clearInterval(cleanupTimer);
        if (server.listening) {
          await new Promise<void>((resolve, rejectClose) => server.close(error => error ? rejectClose(error) : resolve()));
        }
        await Promise.all([...workspaces.values()].map(async entry => {
          await dispose(entry);
          await entry.drained;
        }));
      })();
      return closing;
    },
  };
}

/** End a host-level failure without exposing request payloads or internal error details. */
function reject(response: ServerResponse, status: number, message: string): void {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: message }));
}

/** Reject invalid limits before constructing a listener or allocating transport resources. */
function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`);
  return value;
}

const AUTHENTICATION_TIMEOUT = Symbol('authentication-timeout');

/** Bound authentication even if the verifier ignores abort; cancel cooperative verifiers on expiry. */
async function verifyWithDeadline(verify: VerifyHttpToken, token: string, timeoutMs: number) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(() => verify(token, controller.signal)),
      new Promise<typeof AUTHENTICATION_TIMEOUT>(resolveTimeout => {
        timer = setTimeout(() => {
          resolveTimeout(AUTHENTICATION_TIMEOUT);
          controller.abort();
        }, timeoutMs);
        timer.unref();
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Observe finish/close from before initialization writes any bytes. */
function responseCompletion(response: ServerResponse): Promise<boolean> {
  if (response.writableFinished) return Promise.resolve(true);
  if (response.destroyed) return Promise.resolve(false);
  return new Promise(resolveCompletion => {
    const complete = () => {
      response.off('finish', complete);
      response.off('close', complete);
      resolveCompletion(response.writableFinished);
    };
    response.once('finish', complete);
    response.once('close', complete);
  });
}
