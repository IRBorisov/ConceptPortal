import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IOperationSchemaDTO, ossApi } from '@/features/oss/backend/api';
import { rsformsApi } from '@/features/rsform/backend/api';

import { ILibraryItem, LibraryItemID } from '../models/library';
import { libraryApi } from './api';

export const useSetLocation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setLocation,
    onSuccess: (_, variables) => {
      const ossKey = ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey;
      const ossData: IOperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, location: variables.location });
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
      client.setQueryData(rsKey, prev => (!prev ? undefined : { ...prev, location: variables.location }));
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, location: variables.location } : item))
      );
    }
  });

  return {
    setLocation: (
      data: {
        itemID: LibraryItemID; //
        location: string;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
