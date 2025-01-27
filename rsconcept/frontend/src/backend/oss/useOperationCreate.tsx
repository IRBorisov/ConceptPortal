import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';
import { IOperationData } from '@/models/oss';

import { IOperationCreateDTO, ossApi } from './api';

export const useOperationCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-create'],
    mutationFn: ossApi.operationCreate,
    onSuccess: data => {
      client.setQueryData([ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey], data.oss);
      updateTimestamp(data.oss.id);
    }
  });
  return {
    operationCreate: (
      data: {
        itemID: LibraryItemID; //
        data: IOperationCreateDTO;
      },
      onSuccess?: DataCallback<IOperationData>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.new_operation) })
  };
};
