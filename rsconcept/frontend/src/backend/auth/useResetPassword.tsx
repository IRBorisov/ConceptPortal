import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, IPasswordTokenDTO, IResetPasswordDTO } from './api';

export const useResetPassword = () => {
  const client = useQueryClient();
  const validateMutation = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: authApi.validatePasswordToken,
    onSuccess: () => client.invalidateQueries({ queryKey: [authApi.baseKey] })
  });
  const resetMutation = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: authApi.resetPassword,
    onSuccess: () => client.invalidateQueries({ queryKey: [authApi.baseKey] })
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
    isPending: resetMutation.isPending,
    error: resetMutation.error,
    reset: resetMutation.reset
  };
};
