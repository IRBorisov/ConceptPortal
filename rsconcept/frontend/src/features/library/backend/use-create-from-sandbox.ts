import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useCreateFromSandbox = () => {
  const client = useQueryClient();
  const rsformMutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-from-sandbox'],
    mutationFn: libraryApi.createRSFormFromSandbox,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] }),
    onError: () => client.invalidateQueries()
  });
  const rsmodelMutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-model-from-sandbox'],
    mutationFn: libraryApi.createRSModelFromSandbox,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] }),
    onError: () => client.invalidateQueries()
  });
  return {
    createRSFormFromSandbox: rsformMutation.mutateAsync,
    createRSModelFromSandbox: rsmodelMutation.mutateAsync
  };
};
