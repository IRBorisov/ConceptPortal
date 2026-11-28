export type PortalFetch = typeof fetch;
export type PortalItemKind = 'schema' | 'model' | 'oss';
export const PORTAL_ITEM_ROUTES = { schema: 'rsforms', model: 'models', oss: 'oss' } as const;
export const PORTAL_ITEM_TYPES = { schema: 'rsform', model: 'rsmodel', oss: 'oss' } as const;
export const PORTAL_CREATE_OPERATIONS = { schema: 'rsform.create', model: 'model.create', oss: 'oss.create' } as const;
export type PortalReceiptOperation = typeof PORTAL_CREATE_OPERATIONS[PortalItemKind] | 'rsform.publish';

export interface PortalClientOptions {
  fetch?: PortalFetch;
  /** Called only by the trusted application, never from an operation's JSON payload. */
  credential?: () => string | undefined | Promise<string | undefined>;
}

export interface PortalAccount {
  id: number;
  username: string;
  scopes?: ('read' | 'write')[];
  expires_at?: string | null;
}

export interface PortalItemDetails {
  id: number;
  time_update: string;
  title: string;
  alias: string;
  description: string;
  location: string;
  access_policy: string;
  owner: number | null;
  [field: string]: unknown;
}

export interface PortalItemAccess extends Pick<PortalItemDetails, 'id' | 'title' | 'alias' | 'location' | 'access_policy' | 'owner' | 'time_update'> {
  item_type: typeof PORTAL_ITEM_TYPES[PortalItemKind];
  can_write: boolean;
  can_publish_schema: boolean;
}

export interface PortalMutationReceipt {
  target_id: number;
  version_id: number | null;
  revision: string;
  target_metadata: Pick<PortalItemDetails, 'owner' | 'location' | 'access_policy'>;
}

export class PortalConnectionError extends Error {
  readonly code: 'PORTAL_NETWORK' | 'PORTAL_TLS' | 'PORTAL_INVALID_RESPONSE';

  public constructor(code: PortalConnectionError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

const OSS_MUTATION_METHODS = {
  'create-schema': 'POST',
  'import-schema': 'POST',
  'create-synthesis': 'POST',
  'update-operation': 'PATCH',
  'execute-operation': 'POST',
} as const;

export type PortalOssAction = keyof typeof OSS_MUTATION_METHODS;

/** Fixed-origin Portal API, bounded responses, no redirects and no remote error bodies. */
export class PortalHttpError extends Error {
  readonly status: number;
  readonly retryAfter?: string;

  public constructor(status: number, message: string, retryAfter?: string) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/** Stable diagnostics, without upstream response bodies or transport exceptions. */
export function portalFailure(error: unknown) {
  if (error instanceof PortalConnectionError) return { code: error.code, message: error.message,
    nextAction: error.code === 'PORTAL_TLS' ? 'check_portal_tls' : 'check_portal_api' };
  if (!(error instanceof PortalHttpError)) return undefined;
  const [code, nextAction] = ({
    401: ['PORTAL_KEY_REJECTED', 'connect_portal'],
    403: ['PORTAL_FORBIDDEN', 'check_portal_permissions'],
    404: ['PORTAL_NOT_FOUND', 'check_target_and_access'],
    409: ['PORTAL_CONFLICT', 'reread_revision'],
    429: ['PORTAL_RATE_LIMITED', 'wait_before_retry'],
  } as Record<number, [string, string]>)[error.status] ?? ['PORTAL_HTTP_ERROR', 'check_portal_api'];
  return { code, message: error.message, nextAction, status: error.status,
    ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}) };
}

export class PortalClient {
  readonly #origin: string;
  readonly #fetch: PortalFetch;
  readonly #credential?: PortalClientOptions['credential'];

  /** Reject credentials, paths and non-HTTPS origins before accepting an administrator configuration. */
  public constructor(origin: string, options: PortalClientOptions | PortalFetch = {}) {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('Portal requires a fixed HTTPS origin');
    }
    this.#origin = url.origin;
    this.#fetch = typeof options === 'function' ? options : options.fetch ?? fetch;
    this.#credential = typeof options === 'function' ? undefined : options.credential;
  }

  /** Nonsecret origin shown alongside the target ID on the human approval page. */
  public get origin(): string {
    return this.#origin;
  }

  public async getAccount(token?: string): Promise<PortalAccount> {
    return await this.request(token ?? await this.#credential?.(), '/api/agents/me') as PortalAccount;
  }

  public async supportsMutationReceipts(token?: string): Promise<boolean> {
    const result = await this.request(token ?? await this.#credential?.(), '/api/agents/capabilities');
    return result.mutation_receipts === 1;
  }

  public async getDetails(kind: PortalItemKind, id: number, options: { token?: string; anonymous?: boolean } = {}): Promise<PortalItemDetails> {
    const token = options.anonymous ? undefined : options.token ?? await this.#credential?.();
    return await this.request(token, `/api/agents/${PORTAL_ITEM_ROUTES[kind]}/${id}/details`) as PortalItemDetails;
  }

  public async getAccess(id: number, options: { token?: string; anonymous?: boolean } = {}): Promise<PortalItemAccess> {
    const token = options.anonymous ? undefined : options.token ?? await this.#credential?.();
    return await this.request(token, `/api/agents/library/${id}/access`) as PortalItemAccess;
  }

  public async createItem(kind: PortalItemKind, body: unknown, key: string, token?: string): Promise<PortalItemDetails & { committed_time_update?: string }> {
    return await this.request(token ?? await this.#credential?.(), `/api/agents/${PORTAL_ITEM_ROUTES[kind]}`, body, key) as
      PortalItemDetails & { committed_time_update?: string };
  }

  public async publishSchema(id: number, expectedTimeUpdate: string, schema: unknown, key: string, token?: string,
    target?: Pick<PortalItemDetails, 'owner' | 'location' | 'access_policy'>): Promise<{
    version: number; schema: PortalItemDetails; committed_time_update: string;
  }> {
    return await this.request(token ?? await this.#credential?.(), `/api/agents/rsforms/${id}/publish`,
      { expected_time_update: expectedTimeUpdate, schema, ...(target ? { expected_target: target } : {}) }, key) as {
        version: number; schema: PortalItemDetails; committed_time_update: string;
      };
  }

  public async getReceipt(operation: PortalReceiptOperation, key: string, token?: string): Promise<PortalMutationReceipt> {
    return await this.request(token ?? await this.#credential?.(), `/api/agents/receipts/${operation}`, undefined, key) as PortalMutationReceipt;
  }

  /** Never expose fetch exceptions, headers, redirect destinations or untrusted Portal messages. */
  public async request(token: string | undefined, path: string, body?: unknown, idempotencyKey?: string): Promise<Record<string, any>> {
    const [route, query] = path.split('?');
    const reading = body === undefined;
    const allowed = reading
      ? /^\/api\/agents\/(me|capabilities|(rsforms|models|oss)\/[1-9][0-9]*\/details|library\/(context-search|[1-9][0-9]*\/access)|receipts\/(rsform\.(create|publish)|model\.create|oss\.create))$/.test(route)
      : /^\/api\/agents\/((rsforms|models|oss)|rsforms\/[1-9][0-9]*\/(publish|description))$/.test(route);
    if (!allowed || (query !== undefined && route !== '/api/agents/library/context-search') ||
        path.includes('#') || path.split('?').length > 2) {
      throw new Error('Portal route is not allowed');
    }
    if (idempotencyKey !== undefined && !/^[A-Za-z0-9_-]{8,128}$/.test(idempotencyKey))
      throw new Error('Invalid Portal idempotency key');
    return this.send(token, path, reading ? 'GET' : 'POST', body, undefined, 'schema', idempotencyKey);
  }

  /** Send a revision-guarded graph mutation to a fixed Portal route. */
  public mutateOss(token: string, targetId: number, action: PortalOssAction, expectedTimeUpdate: string, body: unknown) {
    if (!Number.isSafeInteger(targetId) || targetId <= 0 || !Object.hasOwn(OSS_MUTATION_METHODS, action))
      throw new Error('Portal OSS route is not allowed');
    return this.send(token, `/api/agents/oss/${targetId}/${action}`, OSS_MUTATION_METHODS[action], body, expectedTimeUpdate, 'OSS');
  }

  /** Append or update one constituent using an existing agent endpoint. */
  public mutateConstituent(token: string, targetId: number, constituentId: number | undefined,
    expectedTimeUpdate: string, body: unknown) {
    if (!Number.isSafeInteger(targetId) || targetId <= 0 ||
        (constituentId !== undefined && (!Number.isSafeInteger(constituentId) || constituentId <= 0)))
      throw new Error('Portal constituent route is not allowed');
    const path = `/api/agents/rsforms/${targetId}/constituents`;
    return constituentId === undefined
      ? this.send(token, path, 'POST', body, expectedTimeUpdate)
      : this.send(token, `${path}/${constituentId}`, 'PATCH', { item_data: body }, expectedTimeUpdate);
  }

  public setModelValues(token: string, targetId: number, expectedTimeUpdate: string, values: unknown) {
    if (!Number.isSafeInteger(targetId) || targetId <= 0) throw new Error('Portal model route is not allowed');
    return this.send(token, `/api/agents/models/${targetId}/set-value`, 'POST', values, expectedTimeUpdate, 'model');
  }

  private async send(token: string | undefined, path: string, method: 'GET' | 'POST' | 'PATCH', body?: unknown,
    expectedTimeUpdate?: string, itemName = 'schema', idempotencyKey?: string): Promise<Record<string, any>> {
    if (method !== 'GET' && !token) throw new Error('Portal writes require a key');
    let response: Response;
    try {
      response = await this.#fetch(this.#origin + path, {
        method,
        redirect: 'error',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(expectedTimeUpdate ? { 'X-Expected-Time-Update': expectedTimeUpdate } : {}),
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
          Accept: 'application/json', 'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      const cause = error instanceof Error ? error.cause as { code?: unknown } | undefined : undefined;
      const tls = typeof cause?.code === 'string' && /^(ERR_TLS_|ERR_SSL_|CERT_|DEPTH_ZERO_|SELF_SIGNED_|UNABLE_TO_VERIFY_|UNABLE_TO_GET_)/.test(cause.code);
      throw new PortalConnectionError(tls ? 'PORTAL_TLS' : 'PORTAL_NETWORK', 'Portal request failed; check Portal status before retrying');
    }
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      const retry = response.status === 429 ? response.headers.get('Retry-After') : null;
      throw new PortalHttpError(response.status,
        response.status === 409
          ? `Portal ${itemName} changed; read the current revision before retrying`
          : response.status === 401 && token ? 'Portal key is invalid or revoked (401); check the connection'
          : `Portal refused the request (${response.status})`,
        retry && (/^\d{1,10}$/.test(retry) || /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d\d:\d\d:\d\d GMT$/.test(retry)) ? retry : undefined,
      );
    }
    if (!response.body) throw new PortalConnectionError('PORTAL_INVALID_RESPONSE', 'Portal returned an invalid response');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        length += chunk.value.length;
        if (length > 4 * 1024 * 1024) throw new Error('Response too large');
        chunks.push(chunk.value);
      }
      const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Invalid object');
      return value;
    } catch {
      throw new PortalConnectionError('PORTAL_INVALID_RESPONSE', 'Portal returned an invalid response; check publication status before retrying');
    } finally {
      await reader.cancel().catch(() => undefined);
    }
  }
}
