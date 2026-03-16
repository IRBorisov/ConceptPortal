import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';

export const useChangePassword = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'change-password'],
    mutationFn: authApi.changePassword,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] })
  });
  return {
    changePassword: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
