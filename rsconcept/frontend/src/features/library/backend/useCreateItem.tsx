import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ICreateLibraryItemDTO, libraryApi } from './api';

export const useCreateItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'create-item'],
    mutationFn: libraryApi.createItem,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] })
  });
  return {
    createItem: (data: ICreateLibraryItemDTO) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
};
