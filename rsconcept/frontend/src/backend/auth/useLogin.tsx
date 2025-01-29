import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';

import { authApi } from './api';

export const useLogin = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['login'],
    mutationFn: authApi.login,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] }),
    onSuccess: () => client.removeQueries({ queryKey: [libraryApi.baseKey] })
  });
  return {
    login: (
      username: string, //
      password: string,
      onSuccess?: () => void
    ) => mutation.mutate({ username, password }, { onSuccess }),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
