import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type IOperationSchemaDTO } from '@/features/oss';
import { type IRSFormDTO } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useSetEditors = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setEditors,
    onSuccess: (_, variables) => {
      const ossKey = KEYS.composite.ossItem({ itemID: variables.itemID });
      const ossData: IOperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, editors: variables.editors });
        return Promise.allSettled(
          ossData.operations
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = KEYS.composite.rsItem({ itemID: item.result });
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        );
      }

      const rsKey = KEYS.composite.rsItem({ itemID: variables.itemID });
      client.setQueryData(rsKey, (prev: IRSFormDTO | undefined) =>
        !prev ? undefined : { ...prev, editors: variables.editors }
      );
    },
    onError: () => client.invalidateQueries()
  });

  return {
    setEditors: (data: { itemID: number; editors: number[] }) => mutation.mutateAsync(data)
  };
};
