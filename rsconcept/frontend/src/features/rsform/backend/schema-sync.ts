import { noopUnsubscribe, TAB_SOURCE_ID } from '@/backend/item-sync-utils';

import { type RSFormDTO, schemaRSForm } from './types';

const SCHEMA_SYNC_CHANNEL = 'portal-schema-sync';

/** Cross-tab schema sync message posted on `portal-schema-sync`. */
export interface SchemaSyncEvent {
  sourceId: string;
  itemID: number;
  data?: RSFormDTO;
}

function isSchemaSyncEvent(value: unknown): value is SchemaSyncEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { sourceId?: unknown }).sourceId === 'string' &&
    typeof (value as { itemID?: unknown }).itemID === 'number'
  );
}

/** Parse and validate an RSForm DTO from a cross-tab schema sync event. */
export function parseSchemaSyncDto(event: SchemaSyncEvent): RSFormDTO | undefined {
  if (event.data === undefined) {
    return undefined;
  }
  const parsed = schemaRSForm.safeParse(event.data);
  if (!parsed.success || parsed.data.id !== event.itemID) {
    return undefined;
  }
  return parsed.data;
}

/** True when the event carries a Zod-validated RSForm DTO whose `id` matches `itemID`. */
export function isSchemaSyncDto(event: SchemaSyncEvent): event is SchemaSyncEvent & { data: RSFormDTO } {
  return parseSchemaSyncDto(event) !== undefined;
}

/**
 * Broadcast a schema change to other browser tabs via `portal-schema-sync`.
 * Pass `data` when the originating tab has a fresh DTO; omit it to signal a refetch-only update.
 */
export function notifySchemaSync(itemID: number, data?: RSFormDTO): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(SCHEMA_SYNC_CHANNEL);
  channel.postMessage({ sourceId: TAB_SOURCE_ID, itemID, data } satisfies SchemaSyncEvent);
  channel.close();
}

/** Subscribe to schema changes from other tabs on `portal-schema-sync`. Returns an unsubscribe function. */
export function subscribeSchemaSync(listener: (event: SchemaSyncEvent) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return noopUnsubscribe;
  }
  const channel = new BroadcastChannel(SCHEMA_SYNC_CHANNEL);
  channel.onmessage = (message: MessageEvent) => {
    if (isSchemaSyncEvent(message.data) && message.data.sourceId !== TAB_SOURCE_ID) {
      listener(message.data);
    }
  };
  return () => channel.close();
}
