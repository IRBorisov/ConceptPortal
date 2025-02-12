import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from './api';
import { IUserLoginDTO } from './types';

export const useLogin = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['login'],
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
