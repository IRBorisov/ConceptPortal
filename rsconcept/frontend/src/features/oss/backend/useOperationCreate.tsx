import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';
import { LibraryItemID } from '@/features/library/models/library';

import { IOperationCreateDTO, ossApi } from './api';

export const useOperationCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-create'],
    mutationFn: ossApi.operationCreate,
    onSuccess: response => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: response.oss.id }).queryKey, response.oss);
      updateTimestamp(response.oss.id);
    }
  });
  return {
    operationCreate: (data: { itemID: LibraryItemID; data: IOperationCreateDTO }) => mutation.mutateAsync(data)
  };
};
