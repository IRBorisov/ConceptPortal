import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { LibraryItemID } from '@/models/library';

import { IOperationDeleteDTO, ossApi } from './api';

export const useOperationDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-delete'],
    mutationFn: ossApi.operationDelete,
    onSuccess: async data => {
      client.setQueryData([ossApi.getOssQueryOptions({ itemID: data.id }).queryKey], data);
      await client.invalidateQueries({ queryKey: [libraryApi.libraryListKey] });
    }
  });
  return {
    operationDelete: (
      data: {
        itemID: LibraryItemID; //
        data: IOperationDeleteDTO;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
