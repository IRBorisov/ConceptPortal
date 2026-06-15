import { useEffect } from 'react';

import { queryClient } from '@/backend/query-client';

import { authApi } from './api';
import { subscribeAuthSync } from './auth-sync';
import { anonymousCurrentUser } from './types';

/** Keep auth and user-specific caches aligned when login/logout happens in another tab. */
export function useAuthSync() {
  useEffect(function subscribeCrossTabAuthSync() {
    return subscribeAuthSync(function handleAuthSync(event) {
      if (event === 'logout') {
        queryClient.setQueryData(authApi.getAuthQueryOptions().queryKey, anonymousCurrentUser);
      } else if (event === 'login') {
        void queryClient.invalidateQueries({ queryKey: [authApi.baseKey] });
      }
      void queryClient.resetQueries();
    });
  }, []);
}
