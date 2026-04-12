import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSForm, type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';
import { type LibraryItem } from '@/domain/library';
import { type RO } from '@/utils/meta';

import { libraryApi } from './api';
import { useLibraryListKey } from './use-library';

export const useSetAccessPolicy = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setAccessPolicy,
    onSuccess: async (_, variables) => {
      const ossKey = KEYS.composite.oss({ itemID: variables.itemID });
      const ossData: OperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, access_policy: variables.policy });
        await Promise.allSettled([
          client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
          ...ossData.operations
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = KEYS.composite.schema({ itemID: item.result });
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        ]);
        return;
      }

      const rsKey = KEYS.composite.schema({ itemID: variables.itemID });
      client.setQueryData(rsKey, (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) =>
        !prev
          ? undefined
          : {
              raw: { ...prev.raw, access_policy: variables.policy },
              transformed: { ...prev.transformed, access_policy: variables.policy }
            }
      );
      const modelKey = KEYS.composite.model({ itemID: variables.itemID });
      client.setQueryData(modelKey, (prev: RSModelDTO | undefined) =>
        !prev ? undefined : { ...prev, access_policy: variables.policy }
      );
      client.setQueryData(libraryKey, (prev: RO<LibraryItem[]> | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, access_policy: variables.policy } : item))
      );
    },
    onError: () => client.invalidateQueries()
  });

  return { setAccessPolicy: mutation.mutateAsync };
};
