import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi, syncOssTargetItemUpdate } from './api';

export const useUpdateOperation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-operation'],
    mutationFn: ossApi.updateOperation,
    onSuccess: (data, variables) => syncOssTargetItemUpdate(client, data, variables),
    onError: () => client.invalidateQueries()
  });
  return { updateOperation: mutation.mutateAsync };
};
