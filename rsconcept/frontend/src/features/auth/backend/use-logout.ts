import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';

export const useLogout = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'logout'],
    mutationFn: authApi.logout,
    onSuccess: () => client.resetQueries()
  });
  return { logout: () => mutation.mutateAsync() };
};
