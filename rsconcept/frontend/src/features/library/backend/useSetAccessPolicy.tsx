import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IOperationSchemaDTO } from '@/features/oss/backend/types';
import { IRSFormDTO } from '@/features/rsform/backend/types';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { AccessPolicy, ILibraryItem } from './types';

export const useSetAccessPolicy = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setAccessPolicy,
    onSuccess: (_, variables) => {
      const ossKey = KEYS.composite.ossItem({ itemID: variables.itemID });
      const ossData: IOperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, access_policy: variables.policy });
        return Promise.allSettled([
          client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
          ...ossData.items
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
      client.setQueryData(rsKey, (prev: IRSFormDTO | undefined) =>
        !prev ? undefined : { ...prev, access_policy: variables.policy }
      );
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, access_policy: variables.policy } : item))
      );
    },
    onError: () => client.invalidateQueries()
  });

  return {
    setAccessPolicy: (data: { itemID: number; policy: AccessPolicy }) => mutation.mutateAsync(data)
  };
};
