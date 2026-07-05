import { type QueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@rsconcept/domain/library';

import { KEYS } from '@/backend/configuration';

/** Apply incoming cache update only when remote is at least as recent as local. */
export function isRemoteAtLeastAsRecent(remote: string | undefined, local: string | undefined): boolean {
  if (!remote || !local) {
    return true;
  }
  return remote >= local;
}

export function patchLibraryTimestamp(client: QueryClient, itemID: number, timeUpdate: string): void {
  client.setQueryData(KEYS.composite.libraryList, (prev: LibraryItem[] | undefined) =>
    prev?.map(item => (item.id === itemID ? { ...item, time_update: timeUpdate } : item))
  );
}
