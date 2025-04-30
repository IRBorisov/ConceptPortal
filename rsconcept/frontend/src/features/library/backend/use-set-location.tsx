import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type IOperationSchemaDTO } from '@/features/oss';
import { type IRSFormDTO } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';
import { type RO } from '@/utils/meta';

import { libraryApi } from './api';
import { type ILibraryItem } from './types';
import { useLibraryListKey } from './use-library';

export const useSetLocation = () => {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setLocation,
    onSuccess: (_, variables) => {
      const ossKey = KEYS.composite.ossItem({ itemID: variables.itemID });
      const ossData: IOperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, location: variables.location });
        return Promise.allSettled([
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
      client.setQueryData(rsKey, (prev: IRSFormDTO | undefined) =>
        !prev ? undefined : { ...prev, location: variables.location }
      );
      client.setQueryData(libraryKey, (prev: RO<ILibraryItem[]> | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, location: variables.location } : item))
      );
    },
    onError: () => client.invalidateQueries()
  });

  return {
    setLocation: (data: { itemID: number; location: string }) => mutation.mutateAsync(data)
  };
};
