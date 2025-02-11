import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ICloneLibraryItemDTO, libraryApi } from './api';

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
