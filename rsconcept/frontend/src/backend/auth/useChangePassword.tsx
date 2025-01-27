import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, IChangePasswordDTO } from './api';

export const useChangePassword = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['change-password'],
    mutationFn: authApi.changePassword,
    onSettled: async () => await client.invalidateQueries({ queryKey: [authApi.baseKey] })
  });
  return {
    changePassword: (
      data: IChangePasswordDTO, //
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess }),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
