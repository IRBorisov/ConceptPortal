import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type IOperationSchemaDTO } from '@/features/oss/backend/types';
import { type IRSFormDTO } from '@/features/rsform/backend/types';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { type ILibraryItem, type IUpdateLibraryItemDTO, LibraryItemType } from './types';

export const useUpdateItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'update-item'],
    mutationFn: libraryApi.updateItem,
    onSuccess: (data: ILibraryItem) => {
      const itemKey =
        data.item_type === LibraryItemType.RSFORM
          ? KEYS.composite.rsItem({ itemID: data.id })
          : KEYS.composite.ossItem({ itemID: data.id });
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
            schema.oss.map(item => client.invalidateQueries({ queryKey: KEYS.composite.ossItem({ itemID: item.id }) }))
          );
        }
      }
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateItem: (data: IUpdateLibraryItemDTO) => mutation.mutateAsync(data)
  };
};
