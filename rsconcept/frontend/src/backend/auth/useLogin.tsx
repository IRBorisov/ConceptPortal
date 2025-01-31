import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi, IUserLoginDTO } from './api';

export const useLogin = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['login'],
    mutationFn: authApi.login,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] }),
    onSuccess: () => client.resetQueries()
  });
  return {
    login: (data: IUserLoginDTO, onSuccess?: () => void, onError?: (error: AxiosError) => void) =>
      mutation.mutate(data, { onSuccess, onError }),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
