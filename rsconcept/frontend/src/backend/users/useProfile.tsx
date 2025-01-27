import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { usersApi } from './api';

export function useProfile() {
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    ...usersApi.getProfileQueryOptions()
  });
  return { profile, isLoading, error };
}

export function useProfileSuspense() {
  const { data: profile } = useSuspenseQuery({
    ...usersApi.getProfileQueryOptions()
  });
  return { profile };
}
