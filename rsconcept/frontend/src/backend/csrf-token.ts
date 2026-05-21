/**
 * CSRF cookie helpers for session-authenticated API calls.
 */
import type { AxiosError } from 'axios';

const CSRF_COOKIE_PREFIX = 'csrftoken=';
/** Matches production `CSRF_COOKIE_DOMAIN` in backend `.env.prod`. */
const CSRF_COOKIE_DOMAIN = '.portal.acconcept.ru';

export const CSRF_CLIENT_MISSING = 'csrf-client-missing';

let refreshInFlight: Promise<string | undefined> | null = null;

export function readCsrfTokenFromCookie(): string | undefined {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith(CSRF_COOKIE_PREFIX))
    ?.slice(CSRF_COOKIE_PREFIX.length);
  return token ? decodeURIComponent(token) : undefined;
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
  const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `csrftoken=; ${expires}; path=/`;
  document.cookie = `csrftoken=; ${expires}; path=/; domain=${CSRF_COOKIE_DOMAIN}`;
}

/**
 * Fetch a fresh CSRF cookie via a safe GET, then read it from `document.cookie`.
 * Concurrent callers share one in-flight request.
 */
export function refreshCsrfToken(fetchAuth: () => Promise<unknown>): Promise<string | undefined> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      clearCsrfCookie();
      try {
        await fetchAuth();
      } catch {
        return undefined;
      }
      return readCsrfTokenFromCookie();
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
