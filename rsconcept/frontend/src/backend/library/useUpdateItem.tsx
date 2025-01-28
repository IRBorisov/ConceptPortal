import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem } from '@/models/library';

import { ILibraryUpdateDTO, libraryApi } from './api';

export const useUpdateItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-item'],
    mutationFn: libraryApi.updateItem,
    onSuccess: (data: ILibraryItem) => {
      client
        .cancelQueries({ queryKey: libraryApi.libraryListKey })
        .then(async () => {
          client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
            prev?.map(item => (item.id === data.id ? data : item))
          );
          await client.invalidateQueries({
            queryKey: [rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey]
          });
        })
        .catch(console.error);
    }
  });
  return {
    updateItem: (data: ILibraryUpdateDTO) => mutation.mutate(data)
  };
};
