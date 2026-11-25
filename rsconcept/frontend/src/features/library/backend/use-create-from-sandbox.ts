import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { notifyLibrarySync } from './library-sync';
import { type CreateRSFormFromSandboxDTO } from './types';

export const useCreateFromSandbox = ({ reportErrorInDialog = false } = {}) => {
  const client = useQueryClient();
  const rsformKey = [libraryApi.baseKey, 'create-from-sandbox'];
  const rsformMutation = useMutation({
    mutationKey: reportErrorInDialog ? rsformKey : [KEYS.global_mutation, ...rsformKey],
    mutationFn: (data: CreateRSFormFromSandboxDTO) => libraryApi.createRSFormFromSandbox(data, !reportErrorInDialog),
    networkMode: reportErrorInDialog ? 'always' : undefined,
    onSuccess: () => {
      notifyLibrarySync();
      return client.invalidateQueries({ queryKey: [libraryApi.baseKey] });
    },
    onError: () => client.invalidateQueries()
  });
  const rsmodelMutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-model-from-sandbox'],
    mutationFn: libraryApi.createRSModelFromSandbox,
    onSuccess: () => {
      notifyLibrarySync();
      return client.invalidateQueries({ queryKey: [libraryApi.baseKey] });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createRSFormFromSandbox: rsformMutation.mutateAsync,
    createRSModelFromSandbox: rsmodelMutation.mutateAsync
  };
};
