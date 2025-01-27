import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { LibraryItemID } from '@/models/library';

import { ITargetOperation, ossApi } from './api';

export const useOperationExecute = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-execute'],
    mutationFn: ossApi.operationExecute,
    onSuccess: async data => {
      client.setQueryData([ossApi.getOssQueryOptions({ itemID: data.id }).queryKey], data);
      await client.invalidateQueries({ queryKey: [libraryApi.libraryListKey] });
    }
  });
  return {
    operationExecute: (
      data: {
        itemID: LibraryItemID; //
        data: ITargetOperation;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
