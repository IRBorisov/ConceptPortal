import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';
import { type IUserLoginDTO } from './types';

export const useLogin = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'login'],
    mutationFn: authApi.login,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] }),
    onSuccess: () => client.resetQueries()
  });
  return {
    login: (data: IUserLoginDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
