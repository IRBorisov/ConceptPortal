import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';

export const useLogin = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'login'],
    mutationFn: authApi.login,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] }),
    onSuccess: () => client.resetQueries()
  });
  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
