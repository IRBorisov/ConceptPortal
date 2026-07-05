import { useEffect } from 'react';

import { KEYS } from '@/backend/configuration';
import { queryClient } from '@/backend/query-client';

import { subscribeLibrarySync } from './library-sync';

/**
 * Subscribe to cross-tab library sync and invalidate library, RSForm, OSS, and RSModel query roots.
 * Used when metadata changes (rename, move, access policy) affect multiple item types.
 */
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
