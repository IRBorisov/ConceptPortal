import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, IChangePasswordDTO } from './api';

export const useChangePassword = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['change-password'],
    mutationFn: authApi.changePassword,
    onSettled: () => client.invalidateQueries({ queryKey: [authApi.baseKey] })
  });
  return {
    changePassword: (data: IChangePasswordDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
