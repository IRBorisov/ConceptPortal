import { type OperationSchemaDTO } from './types';

const OSS_SYNC_CHANNEL = 'portal-oss-sync';

export interface OssSyncEvent {
  itemID: number;
  data?: OperationSchemaDTO;
}

function isOssSyncEvent(value: unknown): value is OssSyncEvent {
  return typeof value === 'object' && value !== null && typeof (value as { itemID?: unknown }).itemID === 'number';
}

export function isOssSyncDto(event: OssSyncEvent): event is OssSyncEvent & { data: OperationSchemaDTO } {
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

/** Notify other tabs that an OSS was modified on the server. */
export function notifyOssSync(itemID: number, data?: OperationSchemaDTO): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(OSS_SYNC_CHANNEL);
  channel.postMessage({ itemID, data } satisfies OssSyncEvent);
  channel.close();
}

/** Subscribe to OSS changes from other tabs. Returns an unsubscribe function. */
export function subscribeOssSync(listener: (event: OssSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(OSS_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isOssSyncEvent(message.data)) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
