import { type RSModelDTO } from './types';

const MODEL_SYNC_CHANNEL = 'portal-model-sync';

export interface ModelSyncEvent {
  itemID: number;
  data?: RSModelDTO;
}

function isModelSyncEvent(value: unknown): value is ModelSyncEvent {
  return typeof value === 'object' && value !== null && typeof (value as { itemID?: unknown }).itemID === 'number';
}

export function isModelSyncDto(event: ModelSyncEvent): event is ModelSyncEvent & { data: RSModelDTO } {
  return (
    event.data !== undefined &&
    typeof event.data === 'object' &&
    event.data.id === event.itemID &&
    typeof event.data.time_update === 'string'
  );
}

function noopUnsubscribe(): void {
  // BroadcastChannel unavailable — nothing to clean up.
}

/** Notify other tabs that a model was modified on the server. */
export function notifyModelSync(itemID: number, data?: RSModelDTO): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(MODEL_SYNC_CHANNEL);
  channel.postMessage({ itemID, data } satisfies ModelSyncEvent);
  channel.close();
}

/** Subscribe to model changes from other tabs. Returns an unsubscribe function. */
export function subscribeModelSync(listener: (event: ModelSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(MODEL_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isModelSyncEvent(message.data)) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
