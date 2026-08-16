import { syncSentryUser } from '@/services/sentry';

import { clearCachedCsrfToken } from '@/backend/csrf-token';
import { queryClient } from '@/backend/query-client';

import { authApi } from './api';
import { notifyAuthSync } from './auth-sync';
import { anonymousCurrentUser, type ICurrentUser } from './types';

/**
 * Drop local auth state when the server reports missing credentials (expired/cleared cookie).
 * Idempotent: no-op broadcast when already anonymous.
 */
export function clearLocalAuthSession(): void {
  clearCachedCsrfToken();

  const authKey = authApi.getAuthQueryOptions().queryKey;
  const current = queryClient.getQueryData<ICurrentUser>(authKey);
  if (current?.id == null) {
    queryClient.setQueryData(authKey, anonymousCurrentUser);
    syncSentryUser(anonymousCurrentUser);
    return;
  }

  queryClient.setQueryData(authKey, anonymousCurrentUser);
  syncSentryUser(anonymousCurrentUser);
  notifyAuthSync('logout');
}
