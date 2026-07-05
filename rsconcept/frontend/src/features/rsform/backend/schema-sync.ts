import { type RSFormDTO } from './types';

const SCHEMA_SYNC_CHANNEL = 'portal-schema-sync';

export interface SchemaSyncEvent {
  itemID: number;
  data?: RSFormDTO;
}

function isSchemaSyncEvent(value: unknown): value is SchemaSyncEvent {
  return typeof value === 'object' && value !== null && typeof (value as { itemID?: unknown }).itemID === 'number';
}

export function isSchemaSyncDto(event: SchemaSyncEvent): event is SchemaSyncEvent & { data: RSFormDTO } {
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

/** Notify other tabs that a schema was modified on the server. */
export function notifySchemaSync(itemID: number, data?: RSFormDTO): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(SCHEMA_SYNC_CHANNEL);
  channel.postMessage({ itemID, data } satisfies SchemaSyncEvent);
  channel.close();
}

/** Subscribe to schema changes from other tabs. Returns an unsubscribe function. */
export function subscribeSchemaSync(listener: (event: SchemaSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(SCHEMA_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isSchemaSyncEvent(message.data)) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
