import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { usersApi } from './api';

export function useProfile() {
  const { data: profile } = useSuspenseQuery({
    ...usersApi.getProfileQueryOptions()
  });
  return { profile };
}

export function prefetchProfile() {
  return queryClient.prefetchQuery(usersApi.getProfileQueryOptions());
}
