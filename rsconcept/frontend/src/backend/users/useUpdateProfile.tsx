import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    updateProfile: (data: IUpdateProfileDTO) => mutation.mutate(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
