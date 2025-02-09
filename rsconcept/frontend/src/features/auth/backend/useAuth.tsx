import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/queryClient';

import { authApi } from './api';

export function useAuth() {
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    ...authApi.getAuthQueryOptions()
  });
  return { user, isLoading, isAnonymous: user?.id === null || user === undefined, error };
}

export function useAuthSuspense() {
  const { data: user } = useSuspenseQuery({
    ...authApi.getAuthQueryOptions()
  });
  return { user, isAnonymous: user.id === null };
}

export function prefetchAuth() {
  return queryClient.prefetchQuery(authApi.getAuthQueryOptions());
}
