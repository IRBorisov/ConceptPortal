/** Error text produced by dynamic import failures when client bundle becomes stale. */
const STALE_BUNDLE_MESSAGES = [
  'Failed to fetch dynamically imported module', // Chrome, Edge
  'Importing a module script failed', // Safari
  'error loading dynamically imported module' // Firefox
] as const;

function matchesStaleBundleMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return STALE_BUNDLE_MESSAGES.some(fragment => normalized.includes(fragment.toLowerCase()));
}

/**
 * Check if error is stale bundle error.
 */
export function isStaleBundleError(error: unknown): boolean {
  if (import.meta.env.DEV) {
    return false;
  }
  if (error instanceof Error) {
    return matchesStaleBundleMessage(error.message);
  }
  if (typeof error === 'string') {
    return matchesStaleBundleMessage(error);
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
