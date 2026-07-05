import { noopUnsubscribe, TAB_SOURCE_ID } from '@/backend/item-sync-utils';

const LIBRARY_SYNC_CHANNEL = 'portal-library-sync';

export { LIBRARY_SYNC_CHANNEL };

interface LibrarySyncMessage {
  sourceId: string;
}

function isLibrarySyncMessage(value: unknown): value is LibrarySyncMessage {
  return typeof value === 'object' && value !== null && typeof (value as { sourceId?: unknown }).sourceId === 'string';
}

/** Broadcast library-wide changes to other browser tabs via `portal-library-sync`. */
export function notifyLibrarySync(): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(LIBRARY_SYNC_CHANNEL);
  channel.postMessage({ sourceId: TAB_SOURCE_ID } satisfies LibrarySyncMessage);
  channel.close();
}

/** Subscribe to library-wide changes from other tabs on `portal-library-sync`. Returns an unsubscribe function. */
export function subscribeLibrarySync(listener: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(LIBRARY_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isLibrarySyncMessage(message.data) && message.data.sourceId !== TAB_SOURCE_ID) {
      listener();
    }
  };
  return () => channel.close();
}
