const AUTH_SYNC_CHANNEL = 'portal-auth-sync';

export type AuthSyncEvent = 'login' | 'logout';

function isAuthSyncEvent(value: unknown): value is AuthSyncEvent {
  return value === 'login' || value === 'logout';
}

function noopUnsubscribe(): void {
  // BroadcastChannel unavailable — nothing to clean up.
}

/** Notify other tabs that the session auth state changed. */
export function notifyAuthSync(event: AuthSyncEvent): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
  channel.postMessage(event);
  channel.close();
}

/** Subscribe to auth changes from other tabs. Returns an unsubscribe function. */
export function subscribeAuthSync(listener: (event: AuthSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isAuthSyncEvent(message.data)) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
