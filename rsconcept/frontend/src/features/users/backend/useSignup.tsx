import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IUserSignupDTO, usersApi } from './api';

export const useSignup = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['signup'],
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
