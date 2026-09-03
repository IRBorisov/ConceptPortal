import { type QueryClient } from '@tanstack/react-query';

import { syncSentryUser } from '@/services/sentry';

import { clearCachedCsrfToken } from '@/backend/csrf-token';

import { authApi } from './api';
import { anonymousCurrentUser } from './types';

/**
 * Drop every user-scoped cache after a logout (same tab or broadcast from another tab).
 *
 * Seeds the anonymous user first so auth-dependent UI does not flash, then resets all
 * non-auth queries: private RSForm / OSS / model / library payloads must not stay
 * readable via Back or a known URL without a fresh (now 403) request.
 */
export function applyLoggedOutState(client: QueryClient): void {
  clearCachedCsrfToken();
  client.setQueryData(authApi.getAuthQueryOptions().queryKey, anonymousCurrentUser);
  syncSentryUser(anonymousCurrentUser);
  void client.resetQueries({
    predicate: query => query.queryKey[0] !== authApi.baseKey
  });
}
