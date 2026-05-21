/**
 * CSRF token helpers for session-authenticated API calls.
 *
 * The API host sets `csrftoken` on cross-origin responses; in strict browsers (e.g. Chrome
 * incognito) `document.cookie` on the portal host may stay empty even when the cookie is sent
 * on XHR. We therefore also keep the token from `GET /users/api/auth` (`csrfToken` field).
 */
import type { AxiosError } from 'axios';

const CSRF_COOKIE_PREFIX = 'csrftoken=';
/** Matches production `CSRF_COOKIE_DOMAIN` in backend `.env.prod`. */
const CSRF_COOKIE_DOMAIN = '.portal.acconcept.ru';

export const CSRF_CLIENT_MISSING = 'csrf-client-missing';

let memoryToken: string | undefined;
let refreshInFlight: Promise<string | undefined> | null = null;

export function cacheCsrfFromAuth(data: unknown): void {
  if (typeof data === 'object' && data !== null && 'csrfToken' in data) {
    const token = data.csrfToken;
    if (typeof token === 'string' && token.length > 0) {
      memoryToken = token;
    }
  }
}

function readCsrfTokenFromCookie(): string | undefined {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith(CSRF_COOKIE_PREFIX))
    ?.slice(CSRF_COOKIE_PREFIX.length);
  return token ? decodeURIComponent(token) : undefined;
}

/** Token for `x-csrftoken`: in-memory from auth API first, then `document.cookie`. */
export function getCsrfToken(): string | undefined {
  return memoryToken ?? readCsrfTokenFromCookie();
}

export function isCsrfMissingClientError(error: unknown): boolean {
  return error instanceof Error && error.cause === CSRF_CLIENT_MISSING;
}

export function isCsrfAxiosFailure(error: AxiosError): boolean {
  if (error.response?.status !== 403) {
    return false;
  }
  const data = error.response.data;
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const detail = data.detail;
    if (typeof detail === 'string') {
      return detail.toLowerCase().includes('csrf');
    }
  }
  return error.message.toLowerCase().includes('csrf');
}

function clearCsrfCookie(): void {
  memoryToken = undefined;
  const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `csrftoken=; ${expires}; path=/`;
  document.cookie = `csrftoken=; ${expires}; path=/; domain=${CSRF_COOKIE_DOMAIN}`;
}

export interface RefreshCsrfOptions {
  /** Clear stale cookies before fetching (used after a CSRF 403). */
  resetCookie?: boolean;
}

/**
 * Obtain a CSRF token via `GET /users/api/auth`, then read memory/cookie.
 * Concurrent callers share one in-flight request.
 */
export function refreshCsrfToken(
  fetchAuth: () => Promise<unknown>,
  options?: RefreshCsrfOptions
): Promise<string | undefined> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      if (options?.resetCookie) {
        clearCsrfCookie();
      }
      try {
        const data = await fetchAuth();
        cacheCsrfFromAuth(data);
      } catch {
        return undefined;
      }
      return getCsrfToken();
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
