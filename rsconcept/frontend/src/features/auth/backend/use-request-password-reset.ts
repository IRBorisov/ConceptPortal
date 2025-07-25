import { useMutation } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';
import { type IRequestPasswordDTO } from './types';

export const useRequestPasswordReset = () => {
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'request-password-reset'],
    mutationFn: authApi.requestPasswordReset
  });
  return {
    requestPasswordReset: (data: IRequestPasswordDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
