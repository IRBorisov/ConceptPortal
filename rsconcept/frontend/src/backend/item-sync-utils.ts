import { type QueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@rsconcept/domain/library';

import { KEYS } from '@/backend/configuration';

/** Shared helpers for cross-tab item sync and cache timestamp reconciliation. */

/** Per-tab id for BroadcastChannel sync — lets subscribers ignore self-originated messages. */
export function createTabSourceId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

/** Single per-tab id shared across all sync channels. */
export const TAB_SOURCE_ID = createTabSourceId();

/** No-op unsubscribe when BroadcastChannel is unavailable. */
export function noopUnsubscribe(): void {
  // BroadcastChannel unavailable — nothing to clean up.
}

/** Accept a remote `time_update` when local is missing or not newer than remote. */
export function isRemoteAtLeastAsRecent(remote: string | undefined, local: string | undefined): boolean {
  if (!remote) {
    return false;
  }
  if (!local) {
    return true;
  }
  return remote >= local;
}

/** Invalidate OSS detail caches linked from an RSForm payload. */
export function invalidateRelatedOss(client: QueryClient, ossIds: { id: number }[]): void {
  void Promise.allSettled(
    ossIds.map(item => client.invalidateQueries({ queryKey: KEYS.composite.oss({ itemID: item.id }) }))
  );
}

/** Invalidate RSForm detail caches for the given item ids. */
export function invalidateRelatedSchemas(client: QueryClient, schemaIds: (number | null | undefined)[]): void {
  void Promise.allSettled(
    schemaIds
      .filter((id): id is number => id != null)
      .map(id => client.invalidateQueries({ queryKey: KEYS.composite.schema({ itemID: id }) }))
  );
}

/** Patch `time_update` for one library item inside cached library-list queries. */
export function patchLibraryTimestamp(client: QueryClient, itemID: number, timeUpdate: string): void {
  client.setQueriesData({ queryKey: KEYS.composite.libraryList }, (prev: LibraryItem[] | undefined) =>
    prev?.map(item => (item.id === itemID ? { ...item, time_update: timeUpdate } : item))
  );
}
