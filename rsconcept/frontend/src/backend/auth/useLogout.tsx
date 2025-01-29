import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from './api';

export const useLogout = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: authApi.logout,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] }),
    onSuccess: () => client.removeQueries()
  });
  return { logout: (onSuccess?: () => void) => mutation.mutate(undefined, { onSuccess }) };
};
