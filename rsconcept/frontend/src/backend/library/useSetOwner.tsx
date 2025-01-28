import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';
import { UserID } from '@/models/user';

import { libraryApi } from './api';

export const useSetOwner = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-owner'],
    mutationFn: libraryApi.setOwner,
    onSuccess: (_, variables) => {
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, owner: variables.owner } : item))
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
          owner: variables.owner
        };
      });
    }
  });

  return {
    setOwner: (data: { itemID: LibraryItemID; owner: UserID }) => mutation.mutate(data)
  };
};
