import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ILibraryItem, LibraryItemID } from '@/models/library';

import { libraryApi } from './api';

export const useDeleteItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'delete-item'],
    mutationFn: libraryApi.deleteItem,
    onSuccess: async (_, variables) => {
      await client.cancelQueries({ queryKey: [libraryApi.libraryListKey] });
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.filter(item => item.id !== variables)
      );
    }
  });
  return {
    deleteItem: (
      target: LibraryItemID, //
      onSuccess?: () => void
    ) => mutation.mutate(target, { onSuccess }),
    isPending: mutation.isPending
  };
};
