/** Error text produced by dynamic import failures when client bundle becomes stale. */
const STALE_BUNDLE_MESSAGE = 'Failed to fetch dynamically imported module';

/**
 * Check if error is stale bundle error.
 */
export function isStaleBundleError(error: unknown): boolean {
  if (import.meta.env.DEV) {
    return false;
  }
  if (error instanceof Error) {
    return error.message.includes(STALE_BUNDLE_MESSAGE);
  }
  if (typeof error === 'string') {
    return error.includes(STALE_BUNDLE_MESSAGE);
  }
  return false;
}

/** Handle stale bundle error by reloading page. */
export function handleStaleBundleError(error: unknown): boolean {
  if (!isStaleBundleError(error)) {
    return false;
  }
  console.warn('Detected stale bundle - reloading...');
  window.location.reload();
  return true;
}

/** Rethrow stale bundle errors to be handled by root fallback. */
export function rethrowIfStaleBundleError(error: unknown): void {
  if (isStaleBundleError(error)) {
    throw error;
  }
}
