import { useEffect } from 'react';

import { KEYS } from '@/backend/configuration';
import { queryClient } from '@/backend/query-client';

import { subscribeLibrarySync } from './library-sync';

/** Refresh library caches when library-wide data was modified in another tab. */
export function useLibrarySync() {
  useEffect(function subscribeCrossTabLibrarySync() {
    return subscribeLibrarySync(function handleLibrarySync() {
      void Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: [KEYS.library] }),
        queryClient.invalidateQueries({ queryKey: [KEYS.rsform] }),
        queryClient.invalidateQueries({ queryKey: [KEYS.oss] }),
        queryClient.invalidateQueries({ queryKey: [KEYS.rsmodel] })
      ]);
    });
  }, []);
}
