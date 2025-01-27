import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { UserID } from '@/models/user';

import { libraryApi } from './api';

export const useSetEditors = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setEditors,
    onSuccess: (_, variables) => {
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === variables.itemID ? { ...item, editors: variables.editors } : item))
      );
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey, prev => {
        if (!prev) {
          return undefined;
        }
        return {
          ...prev,
          editors: variables.editors
        };
      });
    }
  });

  return {
    setEditors: (
      data: {
        itemID: LibraryItemID; //
        editors: UserID[];
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
