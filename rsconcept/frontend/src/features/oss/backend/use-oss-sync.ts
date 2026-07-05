import { useEffect } from 'react';

import { queryClient } from '@/backend/query-client';

import { subscribeOssSync } from './oss-sync';
import { handleOssSyncEvent } from './oss-sync-handler';

/**
 * Subscribe to cross-tab OSS sync and keep local OSS, library-list, and RSForm caches aligned.
 * DTO events patch the OSS cache when remote is newer; refetch-only events invalidate affected queries.
 */
export function useOssSync() {
  useEffect(function subscribeCrossTabOssSync() {
    return subscribeOssSync(function onOssSync(event) {
      handleOssSyncEvent(event, queryClient);
    });
  }, []);
}
