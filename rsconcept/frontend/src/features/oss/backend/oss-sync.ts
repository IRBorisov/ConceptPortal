import { noopUnsubscribe, TAB_SOURCE_ID } from '@/backend/item-sync-utils';

import { type OperationSchemaDTO, schemaOperationSchema } from './types';

const OSS_SYNC_CHANNEL = 'portal-oss-sync';

/** Cross-tab OSS sync message posted on `portal-oss-sync`. */
export interface OssSyncEvent {
  sourceId: string;
  itemID: number;
  data?: OperationSchemaDTO;
}

function isOssSyncEvent(value: unknown): value is OssSyncEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { sourceId?: unknown }).sourceId === 'string' &&
    typeof (value as { itemID?: unknown }).itemID === 'number'
  );
}

/** True when the event carries a Zod-validated OSS DTO whose `id` matches `itemID`. */
export function isOssSyncDto(event: OssSyncEvent): event is OssSyncEvent & { data: OperationSchemaDTO } {
  if (event.data === undefined) {
    return false;
  }
  const parsed = schemaOperationSchema.safeParse(event.data);
  if (!parsed.success || parsed.data.id !== event.itemID) {
    return false;
  }
  event.data = parsed.data;
  return true;
}

/**
 * Broadcast an OSS change to other browser tabs via `portal-oss-sync`.
 * Pass `data` when the originating tab has a fresh DTO; omit it to signal a refetch-only update.
 */
export function notifyOssSync(itemID: number, data?: OperationSchemaDTO): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(OSS_SYNC_CHANNEL);
  channel.postMessage({ sourceId: TAB_SOURCE_ID, itemID, data } satisfies OssSyncEvent);
  channel.close();
}

/** Subscribe to OSS changes from other tabs on `portal-oss-sync`. Returns an unsubscribe function. */
export function subscribeOssSync(listener: (event: OssSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(OSS_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isOssSyncEvent(message.data) && message.data.sourceId !== TAB_SOURCE_ID) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
