import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { usersApi } from '@/backend/users/api';
import { IUserProfile, IUserSignupData } from '@/models/user';

export const useSignup = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['signup'],
    mutationFn: usersApi.signup,
    onSuccess: () => client.invalidateQueries({ queryKey: usersApi.getUsersQueryOptions().queryKey })
  });
  return {
    signup: (
      data: IUserSignupData, //
      onSuccess?: DataCallback<IUserProfile>
    ) => mutation.mutate(data, { onSuccess }),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
