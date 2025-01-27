import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { IUserProfile } from '@/models/user';

import { IUpdateProfileDTO, usersApi } from './api';

// TODO: reload users / optimistic update

export const useUpdateProfile = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['update-profile'],
    mutationFn: usersApi.updateProfile,
    onSuccess: async () => await client.invalidateQueries({ queryKey: [usersApi.baseKey] })
  });
  return {
    updateProfile: (
      data: IUpdateProfileDTO, //
      onSuccess?: DataCallback<IUserProfile>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.data as IUserProfile) }),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
