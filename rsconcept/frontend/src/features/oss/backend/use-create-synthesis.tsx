import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ICreateSynthesisDTO } from './types';

export const useCreateSynthesis = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-synthesis'],
    mutationFn: ossApi.createSynthesis,
    onSuccess: data => {
      updateTimestamp(data.oss.id, data.oss.time_update);
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createSynthesis: (data: { itemID: number; data: ICreateSynthesisDTO }) => mutation.mutateAsync(data)
  };
};
