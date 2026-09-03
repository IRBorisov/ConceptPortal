/**
 * Password-reset bearer token handling.
 *
 * Reset e-mails link to `/password-change#token=...` (legacy links used `?token=`).
 * The token is moved from the address bar into `sessionStorage` before Sentry or React
 * start, so it cannot leak into telemetry, Referer headers, history or the router state.
 */

export const PASSWORD_RESET_TOKEN_STORAGE_KEY = 'rsconcept:password-reset-token';

const TOKEN_PARAM = 'token';
const TOKEN_IN_URL_PATTERN = /([?&#]token=)[^&#\s]*/gi;

/**
 * Move a reset token from the current URL (query or fragment) into `sessionStorage`
 * and strip it from the address bar. Safe to call multiple times; no-op without a token.
 */
export function captureResetTokenFromUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get(TOKEN_PARAM);
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  const fromHash = hashParams.get(TOKEN_PARAM);
  const token = fromHash || fromQuery;
  if (!token) {
    return;
  }

  storeResetToken(token);

  url.searchParams.delete(TOKEN_PARAM);
  hashParams.delete(TOKEN_PARAM);
  const hash = hashParams.toString();
  url.hash = hash ? `#${hash}` : '';
  window.history.replaceState(window.history.state, '', url.toString());
}

/** Read the stashed reset token (empty string when absent). */
export function readResetToken(): string {
  try {
    return sessionStorage.getItem(PASSWORD_RESET_TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Forget the stashed reset token (after success, validation failure, or leaving the page). */
export function clearResetToken(): void {
  try {
    sessionStorage.removeItem(PASSWORD_RESET_TOKEN_STORAGE_KEY);
  } catch {
    // ignore privacy mode
  }
}

/** Replace any `token=` value in a URL-like string with a placeholder (telemetry scrubbing). */
export function scrubResetTokenFromUrl(value: string): string {
  return value.replace(TOKEN_IN_URL_PATTERN, '$1[Filtered]');
}

// ====== Internals =========
function storeResetToken(token: string): void {
  try {
    sessionStorage.setItem(PASSWORD_RESET_TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore quota / privacy mode
  }
}
