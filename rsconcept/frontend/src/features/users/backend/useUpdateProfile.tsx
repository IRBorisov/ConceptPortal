import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';

import { IUserProfile } from '../models/user';
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
