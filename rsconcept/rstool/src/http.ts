import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { RSToolAgent } from './models/rstool-agent';
import { RSToolError } from './models/tool-error';
import { RSTOOL_RPC_CONTRACT } from './rpc-contract';
import { handleStdioRequest, type StdioRequest } from './wrapper/stdio-handler';

export { RSTOOL_RPC_CONTRACT } from './rpc-contract';

export interface RSToolHttpIdentity {
  subject: string;
  projectId: string;
}

export interface RSToolHttpOptions {
  verifyToken(token: string, signal: AbortSignal): RSToolHttpIdentity | null | Promise<RSToolHttpIdentity | null>;
  /** Optional host-owned state. Return an agent private to this authenticated subject and project. */
  resolveProjectAgent?(identity: Readonly<RSToolHttpIdentity>): RSToolAgent | undefined;
  /** Credential verification deadline in milliseconds. Defaults to 5000. */
  verifyTimeoutMs?: number;
  maxBodyBytes?: number;
  maxResponseBytes?: number;
}

interface HttpRequest extends StdioRequest {
  params?: Record<string, unknown>;
  state?: { session: object | string } | { sessionId: string };
  returnSession?: boolean;
}

type RpcEnvelope = { id: HttpRequest['id'] | null } & (
  { ok: true; result: unknown; session?: string } | { ok: false; error: { code: string; message: string } }
);

const projectMethods = new Set(['applySchemaPatch', 'getSessionState', 'listDiagnostics', 'analyzeExpression',
  'previewStructure', 'commitStep', 'exportSession', 'exportPortal', 'setModelValues', 'getModelState',
  'evaluate', 'recalculateModel', 'restoreOrder', 'synthesize']);
const responseTooLarge = { code: 'RESPONSE_TOO_LARGE', message: 'The response exceeds the HTTP size limit' };
const uncorrelatedLimitError = JSON.stringify({ id: null, ok: false, error: responseTooLarge });

class RequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Serve the stdio dispatcher over authenticated HTTP. Inline state lives for one operation. */
export function createRSToolRpcServer(options: RSToolHttpOptions) {
  const maxBody = options.maxBodyBytes ?? 1024 * 1024;
  const maxResponse = options.maxResponseBytes ?? 4 * 1024 * 1024;
  const verifyTimeout = options.verifyTimeoutMs ?? 5000;
  if (!Number.isSafeInteger(maxResponse) || maxResponse < Buffer.byteLength(uncorrelatedLimitError))
    throw new RangeError('maxResponseBytes must fit the minimum HTTP error response');
  if (!Number.isSafeInteger(verifyTimeout) || verifyTimeout < 1 || verifyTimeout > 2_147_483_647)
    throw new RangeError('verifyTimeoutMs must be a valid positive timer duration');
  const agentOwners = new WeakMap<RSToolAgent, string>();
  let active = 0;
  return createServer({ requestTimeout: 20_000, headersTimeout: 10_000 }, (request, response) => {
    void handle(request, response);
  });

  async function handle(request: IncomingMessage, response: ServerResponse) {
    let id: HttpRequest['id'] | null = null;
    try {
      if (request.url === '/v1/contract' && request.method === 'GET') {
        send(response, 200, RSTOOL_RPC_CONTRACT);
        return;
      }
      if (request.url !== '/v1/rpc') throw new RequestError(404, 'NOT_FOUND', 'Unknown rstool HTTP route');
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        throw new RequestError(405, 'METHOD_NOT_ALLOWED', 'Send a JSON request using POST');
      }
      if (active >= 16) throw new RequestError(503, 'BUSY', 'The rstool HTTP host is busy');
      active++;
      try {
        const bearer = /^Bearer (\S{1,4096})$/i.exec(request.headers.authorization ?? '');
        const identity = bearer ? await verifyBearer(bearer[1]) : null;
        if (!identity?.subject || !identity.projectId) {
          response.setHeader('WWW-Authenticate', 'Bearer');
          throw new RequestError(401, 'UNAUTHORIZED', 'The HTTP host rejected the credentials');
        }
        const input = await readRequest(request, maxBody);
        id = input.id;
        const state = input.state;
        let agent: RSToolAgent;
        let sessionId: string | undefined;
        if (state && 'sessionId' in state) {
          if (!projectMethods.has(input.method)) throw new RequestError(400, 'BAD_REQUEST', 'This method does not use a project session');
          const project = { subject: identity.subject, projectId: identity.projectId };
          const resolved = options.resolveProjectAgent?.(project);
          const owner = JSON.stringify([project.subject, project.projectId]);
          if (!resolved || (agentOwners.has(resolved) && agentOwners.get(resolved) !== owner))
            throw new RequestError(403, 'STATE_UNAVAILABLE', 'Project session storage is unavailable');
          agentOwners.set(resolved, owner);
          agent = resolved;
          sessionId = state.sessionId;
        } else {
          agent = new RSToolAgent();
          if (state) agent.importData(state.session, 'session');
        }
        const params = sessionId ? { ...input.params, sessionId } : input.params;
        const result = await handleStdioRequest(agent, { id, method: input.method, params });
        if (!result.ok) {
          const { code, message } = result.error!;
          sendRpc(response, 200, { id, ok: false, error: { code, message: code === 'INTERNAL_ERROR' ? 'Operation failed' : message } });
          return;
        }
        const canExport = sessionId || agent.getCurrentSession();
        const session = input.returnSession && canExport ? agent.exportSession(sessionId) : undefined;
        sendRpc(response, 200, { id, ok: true, result: result.result, session });
      } finally {
        active--;
      }
    } catch (error) {
      const failure = error instanceof RequestError ? error : error instanceof RSToolError
        ? new RequestError(400, error.code, error.message) : new RequestError(500, 'INTERNAL_ERROR', 'HTTP operation failed');
      sendRpc(response, failure.status, { id, ok: false, error: { code: failure.code, message: failure.message } });
    }
  }

  async function verifyBearer(token: string) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new RequestError(503, 'AUTH_TIMEOUT', 'Credential verification timed out'));
        controller.abort();
      }, verifyTimeout);
    });
    try {
      return await Promise.race([options.verifyToken(token, controller.signal), deadline]);
    } finally {
      clearTimeout(timer);
    }
  }

  function sendRpc(response: ServerResponse, status: number, envelope: RpcEnvelope) {
    const body = JSON.stringify(envelope);
    if (Buffer.byteLength(body) <= maxResponse) {
      send(response, status, body);
      return;
    }
    const fallback = JSON.stringify({ id: envelope.id, ok: false, error: responseTooLarge });
    send(response, 413, Buffer.byteLength(fallback) <= maxResponse ? fallback : uncorrelatedLimitError);
  }
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

async function readRequest(request: IncomingMessage, limit: number): Promise<HttpRequest> {
  const invalid = new RequestError(400, 'BAD_REQUEST', 'Expected an rstool JSON request with id, method and optional state');
  if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw invalid;
  const tooLarge = new RequestError(413, 'REQUEST_TOO_LARGE', 'The request exceeds the HTTP size limit');
  if (Number(request.headers['content-length']) > limit) throw tooLarge;
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > limit) throw tooLarge;
    chunks.push(chunk);
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw invalid; }
  if (!object(value) || (typeof value.id !== 'number' && typeof value.id !== 'string') || typeof value.method !== 'string' ||
      Object.keys(value).some(key => !['id', 'method', 'params', 'state', 'returnSession'].includes(key)) ||
      (value.params !== undefined && !object(value.params)) || (value.returnSession !== undefined && typeof value.returnSession !== 'boolean')) throw invalid;
  if (value.state !== undefined && (!object(value.state) || Object.keys(value.state).length !== 1 ||
      !(typeof value.state.session === 'string' || object(value.state.session) ||
        (typeof value.state.sessionId === 'string' && value.state.sessionId.length > 0)))) throw invalid;
  if (value.params && Object.hasOwn(value.params, 'sessionId') && value.method !== 'setCurrentSession')
    throw new RequestError(400, 'BAD_REQUEST', 'Send a project reference in state.sessionId');
  return value as unknown as HttpRequest;
}

function send(response: ServerResponse, status: number, body: string | object) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(typeof body === 'string' ? body : JSON.stringify(body));
}
