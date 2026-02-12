import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSFormDTO } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';
import { type RO } from '@/utils/meta';

import { libraryApi } from './api';
import { type LibraryItem } from './types';
import { useLibraryListKey } from './use-library';

export const useSetOwner = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-owner'],
    mutationFn: libraryApi.setOwner,
    onSuccess: async (_, variables) => {
      const ossKey = KEYS.composite.ossItem({ itemID: variables.itemID });
      const ossData: OperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, owner: variables.owner });
        await Promise.allSettled([
          client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
          ...ossData.operations
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = KEYS.composite.rsItem({ itemID: item.result });
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        ]);
      }

      const rsKey = KEYS.composite.rsItem({ itemID: variables.itemID });
      client.setQueryData(rsKey, (prev: RSFormDTO | undefined) =>
        !prev ? undefined : { ...prev, owner: variables.owner }
      );
      client.setQueryData(libraryKey, (prev: RO<LibraryItem[]> | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, owner: variables.owner } : item))
      );
    },
    onError: () => client.invalidateQueries()
  });

  return {
    setOwner: (data: { itemID: number; owner: number; }) => mutation.mutateAsync(data)
  };
};
