import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from './api';
import { ICloneLibraryItemDTO } from './types';

export const useCloneItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'clone-item'],
    mutationFn: libraryApi.cloneItem,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] })
  });
  return {
    cloneItem: (data: ICloneLibraryItemDTO) => mutation.mutateAsync(data)
  };
};
