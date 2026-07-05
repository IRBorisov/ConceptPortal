import { useEffect } from 'react';

import { queryClient } from '@/backend/query-client';

import { subscribeModelSync } from './model-sync';
import { handleModelSyncEvent } from './model-sync-handler';

/**
 * Subscribe to cross-tab model sync and keep local model and library-list caches aligned.
 * DTO events patch the model cache when remote is newer; refetch-only events invalidate affected queries.
 */
export function useModelSync() {
  useEffect(function subscribeCrossTabModelSync() {
    return subscribeModelSync(function onModelSync(event) {
      handleModelSyncEvent(event, queryClient);
    });
  }, []);
}
