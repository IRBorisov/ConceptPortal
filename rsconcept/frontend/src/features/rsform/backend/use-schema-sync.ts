import { useEffect } from 'react';

import { queryClient } from '@/backend/query-client';

import { subscribeSchemaSync } from './schema-sync';
import { handleSchemaSyncEvent } from './schema-sync-handler';

/**
 * Subscribe to cross-tab schema sync and keep local schema, library-list, and OSS caches aligned.
 * DTO events patch the schema cache when remote is newer; refetch-only events invalidate affected queries.
 */
export function useSchemaSync() {
  useEffect(function subscribeCrossTabSchemaSync() {
    return subscribeSchemaSync(function onSchemaSync(event) {
      handleSchemaSyncEvent(event, queryClient);
    });
  }, []);
}
