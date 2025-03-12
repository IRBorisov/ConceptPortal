import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IOperationCreateDTO } from './types';

export const useOperationCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'operation-create'],
    mutationFn: ossApi.operationCreate,
    onSuccess: response => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: response.oss.id }).queryKey, response.oss);
      updateTimestamp(response.oss.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    operationCreate: (data: { itemID: number; data: IOperationCreateDTO }) => mutation.mutateAsync(data)
  };
};
