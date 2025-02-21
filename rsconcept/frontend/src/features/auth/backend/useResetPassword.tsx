import { useMutation } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { authApi } from './api';
import { type IPasswordTokenDTO, type IResetPasswordDTO } from './types';

export const useResetPassword = () => {
  const validateMutation = useMutation({
    mutationKey: [KEYS.auth, 'validate-token'],
    mutationFn: authApi.validatePasswordToken
  });
  const resetMutation = useMutation({
    mutationKey: [KEYS.auth, 'reset-password'],
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
