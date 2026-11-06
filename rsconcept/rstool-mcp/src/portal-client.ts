export type PortalFetch = typeof fetch;

/** Fixed-origin Portal API, bounded responses, no redirects and no remote error bodies. */
export class PortalClient {
  readonly #origin: string;
  readonly #fetch: PortalFetch;

  /** Reject credentials, paths and non-HTTPS origins before accepting an administrator configuration. */
  public constructor(origin: string, request: PortalFetch = fetch) {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('Portal requires a fixed HTTPS origin');
    }
    this.#origin = url.origin;
    this.#fetch = request;
  }

  /** Nonsecret origin shown alongside the target ID on the human approval page. */
  public get origin(): string {
    return this.#origin;
  }

  /** Never expose fetch exceptions, headers, redirect destinations or untrusted Portal messages. */
  public async request(token: string, path: string, body?: unknown): Promise<Record<string, any>> {
    if (!/^\/api\/agents\/(me|rsforms\/[1-9][0-9]*\/(details|publish))$/.test(path)) {
      throw new Error('Portal route is not allowed');
    }
    let response: Response;
    try {
      response = await this.#fetch(this.#origin + path, {
        method: body === undefined ? 'GET' : 'POST',
        redirect: 'error',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new Error('Portal request failed; check publication status before retrying');
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        response.status === 409
          ? 'Portal schema changed; prepare publication again'
          : `Portal refused the request (${response.status})`
      );
    }
    if (!response.body) throw new Error('Portal returned an invalid response');
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
      throw new Error('Portal returned an invalid response; check publication status before retrying');
    } finally {
      await reader.cancel().catch(() => undefined);
    }
  }
}
