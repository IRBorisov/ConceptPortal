import { useMutation } from '@tanstack/react-query';

import { authApi, IRequestPasswordDTO } from './api';

export const useRequestPasswordReset = () => {
  const mutation = useMutation({
    mutationKey: ['request-password-reset'],
    mutationFn: authApi.requestPasswordReset
  });
  return {
    requestPasswordReset: (data: IRequestPasswordDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
