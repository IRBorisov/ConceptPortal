import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';
import { notifyAuthSync } from './auth-sync';
import { applyLoggedOutState } from './logged-out-state';

export const useLogout = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'logout'],
    mutationFn: authApi.logout,
    onMutate: async () => {
      await client.cancelQueries();
    },
    onSuccess: () => {
      applyLoggedOutState(client);
      notifyAuthSync('logout');
    }
  });
  return { logout: mutation.mutateAsync };
};
