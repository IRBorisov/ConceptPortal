import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from '@/backend/oss/api';
import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem, LibraryItemID } from '@/models/library';

import { libraryApi } from './api';

export const useDeleteItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'delete-item'],
    mutationFn: libraryApi.deleteItem,
    onSuccess: (_, variables) => {
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.filter(item => item.id !== variables)
      );
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
        client.invalidateQueries({ queryKey: rsformsApi.getRSFormQueryOptions({ itemID: variables }).queryKey })
      ]);
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
