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
    onSuccess: data => {
      updateTimestamp(data.oss.id, data.oss.time_update);
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createBlock: (data: { itemID: number; data: ICreateBlockDTO }) => mutation.mutateAsync(data)
  };
};
