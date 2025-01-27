import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { authApi } from './api';

export function useAuth() {
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    ...authApi.getAuthQueryOptions()
  });
  return { user, isLoading, error };
}

export function useAuthSuspense() {
  const { data: user } = useSuspenseQuery({
    ...authApi.getAuthQueryOptions()
  });
  return { user };
}
