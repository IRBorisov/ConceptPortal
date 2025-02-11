import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IOperationSchemaDTO, ossApi } from '@/features/oss/backend/api';
import { IRSFormDTO } from '@/features/rsform/backend/api';

import { ILibraryItem, LibraryItemType } from '../models/library';
import { IUpdateLibraryItemDTO, libraryApi } from './api';

export const useUpdateItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-item'],
    mutationFn: libraryApi.updateItem,
    onSuccess: (data: ILibraryItem) => {
      const itemKey = libraryApi.getItemQueryOptions({ itemID: data.id, itemType: data.item_type }).queryKey;
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );
      client.setQueryData(itemKey, (prev: IRSFormDTO | IOperationSchemaDTO | undefined) =>
        !prev ? undefined : { ...prev, ...data }
      );
      if (data.item_type === LibraryItemType.RSFORM) {
        const schema: IRSFormDTO | undefined = client.getQueryData(itemKey);
        if (schema) {
          return Promise.allSettled(
            schema.oss.map(item =>
              client.invalidateQueries({ queryKey: ossApi.getOssQueryOptions({ itemID: item.id }).queryKey })
            )
          );
        }
      }
    }
  });
  return {
    updateItem: (data: IUpdateLibraryItemDTO) => mutation.mutateAsync(data)
  };
};
