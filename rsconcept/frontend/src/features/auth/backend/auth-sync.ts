import { noopUnsubscribe, TAB_SOURCE_ID } from '@/backend/item-sync-utils';

const AUTH_SYNC_CHANNEL = 'portal-auth-sync';

/** Login or logout event broadcast on `portal-auth-sync`. */
export type AuthSyncEvent = 'login' | 'logout';

interface AuthSyncMessage {
  sourceId: string;
  event: AuthSyncEvent;
}

function isAuthSyncEvent(value: unknown): value is AuthSyncEvent {
  return value === 'login' || value === 'logout';
}

function isAuthSyncMessage(value: unknown): value is AuthSyncMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { sourceId?: unknown }).sourceId === 'string' &&
    isAuthSyncEvent((value as { event?: unknown }).event)
  );
}

/** Broadcast a session auth-state change to other browser tabs via `portal-auth-sync`. */
export function notifyAuthSync(event: AuthSyncEvent): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
  channel.postMessage({ sourceId: TAB_SOURCE_ID, event } satisfies AuthSyncMessage);
  channel.close();
}

/** Subscribe to auth changes from other tabs on `portal-auth-sync`. Returns an unsubscribe function. */
export function subscribeAuthSync(listener: (event: AuthSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isAuthSyncMessage(message.data) && message.data.sourceId !== TAB_SOURCE_ID) {
      listener(message.data.event);
    }
  };
  return () => channel.close();
}
