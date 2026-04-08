import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useCreateFromSandbox = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-from-sandbox'],
    mutationFn: libraryApi.createRSFormFromSandbox,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] }),
    onError: () => client.invalidateQueries()
  });
  return {
    createFromSandbox: mutation.mutateAsync
  };
};
