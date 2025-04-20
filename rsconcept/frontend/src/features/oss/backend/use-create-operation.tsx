import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ICreateOperationDTO } from './types';

export const useCreateOperation = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'operation-create'],
    mutationFn: ossApi.createOperation,
    onSuccess: response => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: response.oss.id }).queryKey, response.oss);
      updateTimestamp(response.oss.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createOperation: (data: { itemID: number; data: ICreateOperationDTO }) => mutation.mutateAsync(data)
  };
};
