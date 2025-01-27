import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

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
