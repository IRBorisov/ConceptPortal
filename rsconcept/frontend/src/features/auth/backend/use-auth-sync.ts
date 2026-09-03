import { useEffect } from 'react';

import { queryClient } from '@/backend/query-client';

import { subscribeAuthSync } from './auth-sync';
import { applyLoggedOutState } from './logged-out-state';

/**
 * Subscribe to cross-tab auth sync: reset user-specific caches and align auth state after login/logout.
 * Logout clears the cached current user; login refetches auth and resets all queries.
 */
export function useAuthSync() {
  useEffect(function subscribeCrossTabAuthSync() {
    return subscribeAuthSync(function handleAuthSync(event) {
      if (event === 'logout') {
        applyLoggedOutState(queryClient);
        return;
      }
      void queryClient.resetQueries();
    });
  }, []);
}
