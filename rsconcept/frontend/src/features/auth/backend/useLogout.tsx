import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from './api';

export const useLogout = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: authApi.logout,
    onSuccess: () => client.resetQueries()
  });
  return { logout: () => mutation.mutateAsync() };
};
