import { useMutation } from '@tanstack/react-query';

import { authApi, IPasswordTokenDTO, IResetPasswordDTO } from './api';

export const useResetPassword = () => {
  const validateMutation = useMutation({
    mutationKey: ['validate-token'],
    mutationFn: authApi.validatePasswordToken
  });
  const resetMutation = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: authApi.resetPassword
  });
  return {
    validateToken: (
      data: IPasswordTokenDTO, //
      onSuccess?: () => void
    ) => validateMutation.mutate(data, { onSuccess }),
    resetPassword: (
      data: IResetPasswordDTO, //
      onSuccess?: () => void
    ) => resetMutation.mutate(data, { onSuccess }),
    isPending: resetMutation.isPending || validateMutation.isPending,
    error: resetMutation.error ?? validateMutation.error,
    reset: resetMutation.reset
  };
};
