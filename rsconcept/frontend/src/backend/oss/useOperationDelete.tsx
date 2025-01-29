import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { rsformsApi } from '@/backend/rsform/api';
import { LibraryItemID } from '@/models/library';

import { IOperationDeleteDTO, ossApi } from './api';

export const useOperationDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-delete'],
    mutationFn: ossApi.operationDelete,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    operationDelete: (data: { itemID: LibraryItemID; data: IOperationDeleteDTO }) => mutation.mutate(data)
  };
};
