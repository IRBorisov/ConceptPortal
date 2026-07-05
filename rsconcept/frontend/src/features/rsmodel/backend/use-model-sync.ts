import { useEffect } from 'react';

import { KEYS } from '@/backend/configuration';
import { isRemoteAtLeastAsRecent, patchLibraryTimestamp } from '@/backend/item-sync-utils';
import { queryClient } from '@/backend/query-client';

import { applyRSModel } from './api';
import { isModelSyncDto, subscribeModelSync } from './model-sync';

/** Keep model caches aligned when the model was modified in another tab. */
export function useModelSync() {
  useEffect(function subscribeCrossTabModelSync() {
    return subscribeModelSync(function handleModelSync(event) {
      if (isModelSyncDto(event)) {
        const cached = queryClient.getQueryData<{ time_update: string }>(
          KEYS.composite.model({ itemID: event.itemID })
        );
        if (isRemoteAtLeastAsRecent(event.data.time_update, cached?.time_update)) {
          applyRSModel(event.data, queryClient);
          patchLibraryTimestamp(queryClient, event.itemID, event.data.time_update);
        }
        return;
      }

      void Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: KEYS.composite.model({ itemID: event.itemID }),
          exact: true
        }),
        queryClient.invalidateQueries({ queryKey: KEYS.composite.libraryList })
      ]);
    });
  }, []);
}
