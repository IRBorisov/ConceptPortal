import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';
import { LibraryItemID } from '@/features/library/models/library';

import { IOperationCreateDTO, IOperationDTO, ossApi } from './api';

export const useOperationCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-create'],
    mutationFn: ossApi.operationCreate,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      updateTimestamp(data.oss.id);
    }
  });
  return {
    operationCreate: (
      data: {
        itemID: LibraryItemID; //
        data: IOperationCreateDTO;
      },
      onSuccess?: DataCallback<IOperationDTO>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.new_operation) })
  };
};
