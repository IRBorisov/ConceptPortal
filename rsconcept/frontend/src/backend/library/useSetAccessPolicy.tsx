import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { AccessPolicy, ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';

import { libraryApi } from './api';

export const useSetAccessPolicy = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setAccessPolicy,
    onSuccess: (_, variables) => {
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, access_policy: variables.policy } : item))
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
          access_policy: variables.policy
        };
      });
    }
  });

  return {
    setAccessPolicy: (data: { itemID: LibraryItemID; policy: AccessPolicy }) => mutation.mutate(data)
  };
};
