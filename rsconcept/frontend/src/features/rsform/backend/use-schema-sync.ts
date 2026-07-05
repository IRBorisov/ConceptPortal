import { useEffect } from 'react';

import { KEYS } from '@/backend/configuration';
import { isRemoteAtLeastAsRecent, patchLibraryTimestamp } from '@/backend/item-sync-utils';
import { queryClient } from '@/backend/query-client';

import { applyRSForm } from './api';
import { isSchemaSyncDto, subscribeSchemaSync } from './schema-sync';

/** Keep schema caches aligned when the schema was modified in another tab. */
export function useSchemaSync() {
  useEffect(function subscribeCrossTabSchemaSync() {
    return subscribeSchemaSync(function handleSchemaSync(event) {
      if (isSchemaSyncDto(event)) {
        const cached = queryClient.getQueryData<{ raw: { time_update: string } }>(
          KEYS.composite.schema({ itemID: event.itemID })
        );
        if (isRemoteAtLeastAsRecent(event.data.time_update, cached?.raw.time_update)) {
          applyRSForm(event.data, queryClient);
          patchLibraryTimestamp(queryClient, event.itemID, event.data.time_update);
          void queryClient.invalidateQueries({ queryKey: [KEYS.oss] });
        }
        return;
      }

      void Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: KEYS.composite.schema({ itemID: event.itemID }),
          exact: true
        }),
        queryClient.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        queryClient.invalidateQueries({ queryKey: [KEYS.oss] })
      ]);
    });
  }, []);
}
