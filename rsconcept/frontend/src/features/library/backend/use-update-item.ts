import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSForm, type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';
import { type RO } from '@/utils/meta';

import { libraryApi } from './api';
import { type LibraryItem, LibraryItemType } from './types';
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
          ? KEYS.composite.schema({ itemID: data.id })
          : data.item_type === LibraryItemType.OSS
            ? KEYS.composite.oss({ itemID: data.id })
            : KEYS.composite.model({ itemID: data.id });
      client.setQueryData(libraryKey, (prev: RO<LibraryItem[]> | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );
      if (data.item_type === LibraryItemType.RSFORM) {
        client.setQueryData(itemKey, (prev: { raw: RSFormDTO; transformed: RSForm; } | undefined) => {
          if (!prev) {
            return undefined;
          }
          return { raw: { ...prev.raw, ...data }, transformed: { ...prev.transformed, ...data } };
        });
        const schema = client.getQueryData<{ raw: RSFormDTO; transformed: RSForm; }>(itemKey)?.transformed;
        if (schema) {
          await Promise.allSettled(
            schema.oss.map(item => client.invalidateQueries({ queryKey: KEYS.composite.oss({ itemID: item.id }) }))
          );
        }
      } else {
        client.setQueryData(itemKey, (prev: OperationSchemaDTO | RSModelDTO | undefined) =>
          !prev ? undefined : { ...prev, ...data }
        );
      }
    },
    onError: () => client.invalidateQueries()
  });
  return { updateItem: mutation.mutateAsync };
};
