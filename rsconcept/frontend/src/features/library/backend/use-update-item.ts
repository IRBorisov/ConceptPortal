import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';
import { type RO } from '@/utils/meta';

import { libraryApi } from './api';
import { type LibraryItem, LibraryItemType, type UpdateLibraryItemDTO } from './types';
import { useLibraryListKey } from './use-library';

export const useUpdateItem = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'update-item'],
    mutationFn: libraryApi.updateItem,
    onSuccess: async (data: LibraryItem) => {
      const itemKey =
        data.item_type === LibraryItemType.RSFORM
          ? KEYS.composite.rsItem({ itemID: data.id })
          : data.item_type === LibraryItemType.OSS
            ? KEYS.composite.ossItem({ itemID: data.id })
            : KEYS.composite.modelItem({ itemID: data.id });
      client.setQueryData(libraryKey, (prev: RO<LibraryItem[]> | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );
      client.setQueryData(itemKey, (prev: RSFormDTO | OperationSchemaDTO | RSModelDTO | undefined) =>
        !prev ? undefined : { ...prev, ...data }
      );
      if (data.item_type === LibraryItemType.RSFORM) {
        const schema: RSFormDTO | undefined = client.getQueryData(itemKey);
        if (schema) {
          await Promise.allSettled(
            schema.oss.map(item => client.invalidateQueries({ queryKey: KEYS.composite.ossItem({ itemID: item.id }) }))
          );
        }
      }
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateItem: (data: UpdateLibraryItemDTO) => mutation.mutateAsync(data)
  };
};
