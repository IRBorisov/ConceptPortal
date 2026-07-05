import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi, syncOssTargetItemUpdate } from './api';

export const useUpdateBlock = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-block'],
    mutationFn: ossApi.updateBlock,
    onSuccess: (data, variables) => syncOssTargetItemUpdate(client, data, variables),
    onError: () => client.invalidateQueries()
  });
  return { updateBlock: mutation.mutateAsync };
};
