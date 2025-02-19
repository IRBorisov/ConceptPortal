import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { ICloneLibraryItemDTO } from './types';

export const useCloneItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'clone-item'],
    mutationFn: libraryApi.cloneItem,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] }),
    onError: () => client.invalidateQueries()
  });
  return {
    cloneItem: (data: ICloneLibraryItemDTO) => mutation.mutateAsync(data)
  };
};
