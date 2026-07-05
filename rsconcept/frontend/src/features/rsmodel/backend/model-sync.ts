import { noopUnsubscribe, TAB_SOURCE_ID } from '@/backend/item-sync-utils';

import { type RSModelDTO, schemaRSModel } from './types';

const MODEL_SYNC_CHANNEL = 'portal-model-sync';

/** Cross-tab model sync message posted on `portal-model-sync`. */
export interface ModelSyncEvent {
  sourceId: string;
  itemID: number;
  data?: RSModelDTO;
}

function isModelSyncEvent(value: unknown): value is ModelSyncEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { sourceId?: unknown }).sourceId === 'string' &&
    typeof (value as { itemID?: unknown }).itemID === 'number'
  );
}

/**
 * True when the event carries a Zod-validated RSModel DTO whose `id` matches `itemID`.
 * Normalizes `event.data` in place when validation succeeds.
 */
export function isModelSyncDto(event: ModelSyncEvent): event is ModelSyncEvent & { data: RSModelDTO } {
  if (event.data === undefined) {
    return false;
  }
  const parsed = schemaRSModel.safeParse(event.data);
  if (!parsed.success || parsed.data.id !== event.itemID) {
    return false;
  }
  event.data = parsed.data;
  return true;
}

/**
 * Broadcast a model change to other browser tabs via `portal-model-sync`.
 * Pass `data` when the originating tab has a fresh DTO; omit it to signal a refetch-only update.
 */
export function notifyModelSync(itemID: number, data?: RSModelDTO): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(MODEL_SYNC_CHANNEL);
  channel.postMessage({ sourceId: TAB_SOURCE_ID, itemID, data } satisfies ModelSyncEvent);
  channel.close();
}

/** Subscribe to model changes from other tabs on `portal-model-sync`. Returns an unsubscribe function. */
export function subscribeModelSync(listener: (event: ModelSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(MODEL_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isModelSyncEvent(message.data) && message.data.sourceId !== TAB_SOURCE_ID) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
