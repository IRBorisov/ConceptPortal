import { useEffect } from 'react';

import { syncSentryUser } from '@/services/sentry';

import { queryClient } from '@/backend/query-client';

import { authApi } from './api';
import { subscribeAuthSync } from './auth-sync';
import { anonymousCurrentUser } from './types';

/**
 * Subscribe to cross-tab auth sync: reset user-specific caches and align auth state after login/logout.
 * Logout clears the cached current user; login refetches auth and resets all queries.
 */
export function useAuthSync() {
  useEffect(function subscribeCrossTabAuthSync() {
    return subscribeAuthSync(function handleAuthSync(event) {
      if (event === 'logout') {
        queryClient.setQueryData(authApi.getAuthQueryOptions().queryKey, anonymousCurrentUser);
        syncSentryUser(anonymousCurrentUser);
        void queryClient.resetQueries({
          predicate: query => query.queryKey[0] !== authApi.baseKey
        });
        return;
      }
      void queryClient.resetQueries();
    });
  }, []);
}
