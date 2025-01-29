import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from '@/backend/oss/api';
import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { IOperationSchemaData } from '@/models/oss';
import { UserID } from '@/models/user';

import { libraryApi } from './api';

export const useSetOwner = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-owner'],
    mutationFn: libraryApi.setOwner,
    onSuccess: (_, variables) => {
      const ossKey = ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey;
      const ossData: IOperationSchemaData | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, owner: variables.owner });
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
      client.setQueryData(rsKey, prev => (!prev ? undefined : { ...prev, owner: variables.owner }));
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, owner: variables.owner } : item))
      );
    }
  });

  return {
    setOwner: (data: { itemID: LibraryItemID; owner: UserID }) => mutation.mutate(data)
  };
};
