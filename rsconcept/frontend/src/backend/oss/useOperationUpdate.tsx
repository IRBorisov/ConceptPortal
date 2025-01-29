import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { rsformsApi } from '@/backend/rsform/api';
import { ILibraryItem, LibraryItemID } from '@/models/library';

import { IOperationUpdateDTO, ossApi } from './api';

export const useOperationUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-update'],
    mutationFn: ossApi.operationUpdate,
    onSuccess: (data, variables) => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      const schemaID = data.items.find(item => item.id === variables.data.target)?.result;
      if (!schemaID) {
        return;
      }
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        !prev
          ? undefined
          : prev.map(item =>
              item.id === schemaID ? { ...item, ...variables.data.item_data, time_update: Date() } : item
            )
      );
      return client.invalidateQueries({
        queryKey: rsformsApi.getRSFormQueryOptions({ itemID: schemaID }).queryKey
      });
    }
  });
  return {
    operationUpdate: (data: { itemID: LibraryItemID; data: IOperationUpdateDTO }) => mutation.mutate(data)
  };
};
