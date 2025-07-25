import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { usersApi } from './api';
import { type IUserSignupDTO } from './types';

export const useSignup = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.users, 'signup'],
    mutationFn: usersApi.signup,
    onSuccess: () => client.invalidateQueries({ queryKey: usersApi.getUsersQueryOptions().queryKey })
  });
  return {
    signup: (data: IUserSignupDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
