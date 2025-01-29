import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from '@/backend/oss/api';
import { ILibraryItem, LibraryItemType } from '@/models/library';
import { IOperationSchemaData } from '@/models/oss';
import { IRSFormData } from '@/models/rsform';

import { ILibraryUpdateDTO, libraryApi } from './api';

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
      client.setQueryData(itemKey, (prev: IRSFormData | IOperationSchemaData | undefined) =>
        !prev ? undefined : { ...prev, ...data }
      );
      if (data.item_type === LibraryItemType.RSFORM) {
        const schema: IRSFormData | undefined = client.getQueryData(itemKey);
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
    updateItem: (data: ILibraryUpdateDTO) => mutation.mutate(data)
  };
};
