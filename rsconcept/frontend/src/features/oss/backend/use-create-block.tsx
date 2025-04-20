import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ICreateBlockDTO } from './types';

export const useCreateBlock = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-block'],
    mutationFn: ossApi.createBlock,
    onSuccess: response => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: response.oss.id }).queryKey, response.oss);
      updateTimestamp(response.oss.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createBlock: (data: { itemID: number; data: ICreateBlockDTO }) => mutation.mutateAsync(data)
  };
};
