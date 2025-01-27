import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { LibraryItemID } from '@/models/library';

import { IOperationUpdateDTO, ossApi } from './api';

export const useOperationUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-update'],
    mutationFn: ossApi.operationUpdate,
    onSuccess: async data => {
      client.setQueryData([ossApi.getOssQueryOptions({ itemID: data.id }).queryKey], data);
      await client.invalidateQueries({ queryKey: [libraryApi.libraryListKey] });
    }
  });
  return {
    operationUpdate: (
      data: {
        itemID: LibraryItemID; //
        data: IOperationUpdateDTO;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
