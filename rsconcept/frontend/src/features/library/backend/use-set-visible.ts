import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem, type RSForm } from '@rsconcept/domain/library';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSFormDTO } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { notifyLibrarySync } from './library-sync';
import { useLibraryListKey } from './use-library';

export const useSetVisible = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-visible'],
    mutationFn: libraryApi.setVisible,
    onSuccess: (_, variables) => {
      client.setQueryData(libraryKey, (prev: LibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, visible: variables.visible } : item))
      );

      const rsFormKey = [KEYS.rsform, 'item', variables.itemID];
      client.setQueriesData({ queryKey: rsFormKey }, (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) =>
        !prev
          ? undefined
          : {
              raw: { ...prev.raw, visible: variables.visible },
              transformed: { ...prev.transformed, visible: variables.visible }
            }
      );

      const ossKey = KEYS.composite.oss({ itemID: variables.itemID });
      client.setQueryData(ossKey, (prev: OperationSchemaDTO | undefined) =>
        !prev ? undefined : { ...prev, visible: variables.visible }
      );

      const modelKey = KEYS.composite.model({ itemID: variables.itemID });
      client.setQueryData(modelKey, (prev: RSModelDTO | undefined) =>
        !prev ? undefined : { ...prev, visible: variables.visible }
      );
      notifyLibrarySync();
    },
    onError: () => client.invalidateQueries()
  });

  return { setVisible: mutation.mutateAsync };
};
