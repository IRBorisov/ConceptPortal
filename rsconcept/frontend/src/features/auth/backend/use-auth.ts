import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { authApi } from './api';

export function useAuth() {
  const { data: user } = useSuspenseQuery({
    ...authApi.getAuthQueryOptions()
  });
  return { user, isAnonymous: user.id === null };
}

export function prefetchAuth() {
  return queryClient.prefetchQuery(authApi.getAuthQueryOptions());
}
