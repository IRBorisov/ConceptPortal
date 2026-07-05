import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem, type RSForm } from '@rsconcept/domain/library';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { notifyLibrarySync } from './library-sync';
import { useLibraryListKey } from './use-library';

export const useSetOwner = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-owner'],
    mutationFn: libraryApi.setOwner,
    onSuccess: async (_, variables) => {
      const ossKey = KEYS.composite.oss({ itemID: variables.itemID });
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
              const itemKey = KEYS.composite.schema({ itemID: item.result });
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        ]);
      }

      const rsFormKey = [KEYS.rsform, 'item', variables.itemID];
      client.setQueriesData({ queryKey: rsFormKey }, (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) =>
        !prev
          ? undefined
          : {
              raw: { ...prev.raw, owner: variables.owner },
              transformed: { ...prev.transformed, owner: variables.owner }
            }
      );

      const modelKey = KEYS.composite.model({ itemID: variables.itemID });
      client.setQueryData(modelKey, (prev: RSModelDTO | undefined) =>
        !prev ? undefined : { ...prev, owner: variables.owner }
      );
      client.setQueryData(libraryKey, (prev: LibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, owner: variables.owner } : item))
      );
      notifyLibrarySync();
    },
    onError: () => client.invalidateQueries()
  });

  return { setOwner: mutation.mutateAsync };
};
