import { useMutation } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';

export const useRequestPasswordReset = () => {
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'request-password-reset'],
    mutationFn: authApi.requestPasswordReset
  });
  return {
    requestPasswordReset: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
