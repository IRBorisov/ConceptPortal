import { type QueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { prepareCrossTabDataReset } from '@/backend/cross-tab-reset-notify';
import { isRemoteAtLeastAsRecent, patchLibraryTimestamp } from '@/backend/item-sync-utils';

import { applyRSModel } from './api';
import { isModelSyncDto, type ModelSyncEvent } from './model-sync';

function invalidateModelItem(client: QueryClient, itemID: number): void {
  void Promise.allSettled([
    client.invalidateQueries({
      queryKey: KEYS.composite.model({ itemID }),
      exact: true
    }),
    client.invalidateQueries({ queryKey: KEYS.composite.libraryList })
  ]);
}

/** Apply a cross-tab model sync event to the local query cache. */
export function handleModelSyncEvent(event: ModelSyncEvent, client: QueryClient): void {
  const notifyReset = prepareCrossTabDataReset(event.itemID);

  if (isModelSyncDto(event)) {
    const cached = client.getQueryData<{ time_update: string }>(KEYS.composite.model({ itemID: event.itemID }));
    if (isRemoteAtLeastAsRecent(event.data.time_update, cached?.time_update)) {
      notifyReset();
      applyRSModel(event.data, client);
      patchLibraryTimestamp(client, event.itemID, event.data.time_update);
      return;
    }
  }

  notifyReset();
  invalidateModelItem(client, event.itemID);
}
