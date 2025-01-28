import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { libraryApi } from '@/backend/library/api';
import { ILibraryItem, LibraryItemID } from '@/models/library';

import { ITargetOperation, ossApi } from './api';

export const useInputCreate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'input-create'],
    mutationFn: ossApi.inputCreate,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      await client.invalidateQueries({ queryKey: [libraryApi.libraryListKey] });
    }
  });
  return {
    inputCreate: (
      data: {
        itemID: LibraryItemID; //
        data: ITargetOperation;
      },
      onSuccess?: DataCallback<ILibraryItem>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.new_schema) })
  };
};
