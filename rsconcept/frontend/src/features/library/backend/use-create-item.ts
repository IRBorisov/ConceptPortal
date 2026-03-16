import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useCreateItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-item'],
    mutationFn: libraryApi.createItem,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] }),
    onError: () => client.invalidateQueries()
  });
  return {
    createItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
