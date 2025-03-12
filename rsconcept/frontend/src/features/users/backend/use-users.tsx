import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { usersApi } from './api';

export function useUsersSuspense() {
  const { data: users } = useSuspenseQuery({
    ...usersApi.getUsersQueryOptions()
  });
  return { users };
}

export function useUsers() {
  const { data: users } = useQuery({
    ...usersApi.getUsersQueryOptions()
  });
  return { users: users ?? [] };
}

export function prefetchUsers() {
  return queryClient.prefetchQuery(usersApi.getUsersQueryOptions());
}
