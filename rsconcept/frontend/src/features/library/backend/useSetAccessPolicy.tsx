import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IOperationSchemaDTO, ossApi } from '@/features/oss/backend/api';
import { rsformsApi } from '@/features/rsform/backend/api';

import { AccessPolicy, ILibraryItem, LibraryItemID } from '../models/library';
import { libraryApi } from './api';

export const useSetAccessPolicy = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setAccessPolicy,
    onSuccess: (_, variables) => {
      const ossKey = ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey;
      const ossData: IOperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, access_policy: variables.policy });
        return Promise.allSettled([
          client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
          ...ossData.items
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = rsformsApi.getRSFormQueryOptions({ itemID: item.result }).queryKey;
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        ]);
      }

      const rsKey = rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey;
      client.setQueryData(rsKey, prev => (!prev ? undefined : { ...prev, access_policy: variables.policy }));
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, access_policy: variables.policy } : item))
      );
    }
  });

  return {
    setAccessPolicy: (data: { itemID: LibraryItemID; policy: AccessPolicy }) => mutation.mutateAsync(data)
  };
};
