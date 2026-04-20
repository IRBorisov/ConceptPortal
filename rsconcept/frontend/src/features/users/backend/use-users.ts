import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { usersApi } from './api';

export function useUsers() {
  const { data: users } = useSuspenseQuery({
    ...usersApi.getUsersQueryOptions()
  });
  return { users };
}

export function prefetchUsers() {
  return queryClient.prefetchQuery(usersApi.getUsersQueryOptions());
}
