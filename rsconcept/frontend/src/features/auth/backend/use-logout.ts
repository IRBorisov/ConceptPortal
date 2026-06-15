import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';
import { notifyAuthSync } from './auth-sync';
import { anonymousCurrentUser } from './types';

export const useLogout = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'logout'],
    mutationFn: authApi.logout,
    onMutate: async () => {
      await client.cancelQueries();
    },
    onSuccess: () => {
      client.setQueryData(authApi.getAuthQueryOptions().queryKey, anonymousCurrentUser);
      notifyAuthSync('logout');
    }
  });
  return { logout: mutation.mutateAsync };
};
