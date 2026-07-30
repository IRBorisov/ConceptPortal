import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem, LibraryItemType, type RSForm } from '@rsconcept/domain/library';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { notifyLibrarySync } from './library-sync';
import { useLibraryListKey } from './use-library';

function patchReadOnlyCaches(
  client: ReturnType<typeof useQueryClient>,
  libraryKey: unknown[],
  itemID: number,
  readOnly: boolean
) {
  client.setQueryData(libraryKey, (prev: LibraryItem[] | undefined) =>
    prev?.map(item => (item.id === itemID ? { ...item, read_only: readOnly } : item))
  );

  const rsFormKey = [KEYS.rsform, 'item', itemID];
  client.setQueriesData({ queryKey: rsFormKey }, (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) =>
    !prev
      ? undefined
      : {
          raw: { ...prev.raw, read_only: readOnly },
          transformed: { ...prev.transformed, read_only: readOnly }
        }
  );

  const ossKey = KEYS.composite.oss({ itemID });
  const ossData: OperationSchemaDTO | undefined = client.getQueryData(ossKey);
  client.setQueryData(ossKey, (prev: OperationSchemaDTO | undefined) =>
    !prev ? undefined : { ...prev, read_only: readOnly }
  );

  const modelKey = KEYS.composite.model({ itemID });
  client.setQueryData(modelKey, (prev: RSModelDTO | undefined) =>
    !prev ? undefined : { ...prev, read_only: readOnly }
  );

  return ossData;
}

export const useSetReadOnly = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-read-only'],
    mutationFn: libraryApi.setReadOnly,
    onSuccess: async (_, variables) => {
      const ossData = patchReadOnlyCaches(client, libraryKey, variables.itemID, variables.readOnly);
      if (ossData?.item_type === LibraryItemType.OSS) {
        await Promise.allSettled(
          ossData.operations
            .map(item => {
              if (!item.result) {
                return;
              }
              return client.invalidateQueries({ queryKey: KEYS.composite.schema({ itemID: item.result }) });
            })
            .filter(item => !!item)
        );
      }
      notifyLibrarySync();
    },
    onError: () => client.invalidateQueries()
  });

  return { setReadOnly: mutation.mutateAsync };
};
