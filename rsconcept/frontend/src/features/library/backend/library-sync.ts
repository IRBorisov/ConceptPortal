const LIBRARY_SYNC_CHANNEL = 'portal-library-sync';

function noopUnsubscribe(): void {
  // BroadcastChannel unavailable — nothing to clean up.
}

/** Notify other tabs that library-wide data was modified. */
export function notifyLibrarySync(): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(LIBRARY_SYNC_CHANNEL);
  channel.postMessage('refresh');
  channel.close();
}

/** Subscribe to library-wide changes from other tabs. Returns an unsubscribe function. */
export function subscribeLibrarySync(listener: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(LIBRARY_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (message.data === 'refresh') {
      listener();
    }
  };
  return () => channel.close();
}
