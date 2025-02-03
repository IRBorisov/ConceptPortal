import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IUserProfile } from '@/models/user';

import { DataCallback } from '../apiTransport';
import { IUpdateProfileDTO, usersApi } from './api';

export const useUpdateProfile = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['update-profile'],
    mutationFn: usersApi.updateProfile,
    onSuccess: data => {
      client.setQueryData(usersApi.getProfileQueryOptions().queryKey, data);
      return client.invalidateQueries({ queryKey: usersApi.getUsersQueryOptions().queryKey });
    }
  });
  return {
    updateProfile: (data: IUpdateProfileDTO, onSuccess?: DataCallback<IUserProfile>) =>
      mutation.mutate(data, { onSuccess }),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
