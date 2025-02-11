import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    updateProfile: (data: IUpdateProfileDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
