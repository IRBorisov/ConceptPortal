import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type OperationSchemaDTO } from '@/features/oss';
import { type RSForm } from '@/features/rsform';
import { type RSModelDTO } from '@/features/rsmodel';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useSetEditors = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setEditors,
    onSuccess: async (_, variables) => {
      const ossKey = KEYS.composite.oss({ itemID: variables.itemID });
      const ossData: OperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, editors: variables.editors });
        await Promise.allSettled(
          ossData.operations
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = KEYS.composite.schema({ itemID: item.result });
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        );
        return;
      }

      const rsKey = KEYS.composite.schema({ itemID: variables.itemID });
      client.setQueryData(rsKey, (prev: RSForm | undefined) =>
        !prev ? undefined : { ...prev, editors: variables.editors }
      );
      const modelKey = KEYS.composite.model({ itemID: variables.itemID });
      client.setQueryData(modelKey, (prev: RSModelDTO | undefined) =>
        !prev ? undefined : { ...prev, editors: variables.editors }
      );
    },
    onError: () => client.invalidateQueries()
  });

  return {
    setEditors: mutation.mutateAsync
  };
};
