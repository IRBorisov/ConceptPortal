import { useMutation } from '@tanstack/react-query';

import { authApi } from './api';
import { IPasswordTokenDTO, IResetPasswordDTO } from './types';

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
    validateToken: (data: IPasswordTokenDTO) => validateMutation.mutateAsync(data),
    resetPassword: (data: IResetPasswordDTO) => resetMutation.mutateAsync(data),
    isPending: resetMutation.isPending || validateMutation.isPending,
    error: resetMutation.error ?? validateMutation.error,
    reset: resetMutation.reset
  };
};
