import { useEffect } from 'react';

import { KEYS } from '@/backend/configuration';
import { isRemoteAtLeastAsRecent, patchLibraryTimestamp } from '@/backend/item-sync-utils';
import { queryClient } from '@/backend/query-client';

import { applyOss } from './api';
import { isOssSyncDto, subscribeOssSync } from './oss-sync';

/** Keep OSS caches aligned when the OSS was modified in another tab. */
export function useOssSync() {
  useEffect(function subscribeCrossTabOssSync() {
    return subscribeOssSync(function handleOssSync(event) {
      if (isOssSyncDto(event)) {
        const cached = queryClient.getQueryData<{ time_update: string }>(KEYS.composite.oss({ itemID: event.itemID }));
        if (isRemoteAtLeastAsRecent(event.data.time_update, cached?.time_update)) {
          applyOss(event.data, queryClient);
          patchLibraryTimestamp(queryClient, event.itemID, event.data.time_update);
          void queryClient.invalidateQueries({ queryKey: [KEYS.rsform] });
        }
        return;
      }

      void Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: KEYS.composite.oss({ itemID: event.itemID }),
          exact: true
        }),
        queryClient.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        queryClient.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    });
  }, []);
}
