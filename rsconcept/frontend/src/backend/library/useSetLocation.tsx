import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';

import { libraryApi } from './api';

export const useSetLocation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setLocation,
    onSuccess: (_, variables) => {
      // const ossKey = ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey;
      // const ossData = client.getQueryData(ossKey);
      // if (ossData) {
      //   client.setQueryData(ossKey, { ...ossData, editors: variables.editors });
      //   Promise.allSettled([
      //     client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
      //     ...ossData.items.map(item => {
      //       if (!item.result) {
      //         return;
      //       }
      //       const itemKey = rsformsApi.getRSFormQueryOptions({ itemID: item.result }).queryKey;
      //       return client.invalidateQueries({ queryKey: itemKey });
      //     })
      //   ]).catch(console.error);
      // } else {
      //   const rsKey = rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey;
      //   client.setQueryData(rsKey, prev => (!prev ? undefined : { ...prev, editors: variables.editors }));
      //   client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
      //     prev?.map(item => (item.id === variables.itemID ? { ...item, editors: variables.editors } : item))
      //   );
      // }

      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, location: variables.location } : item))
      );
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey, prev => {
        if (!prev) {
          return undefined;
        }
        if (prev.item_type === LibraryItemType.OSS) {
          client.invalidateQueries({ queryKey: [libraryApi.libraryListKey] }).catch(console.error);
        }
        return {
          ...prev,
          location: variables.location
        };
      });
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
