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
    onSuccess: response => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: response.oss.id }).queryKey, response.oss);
      updateTimestamp(response.oss.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createSynthesis: (data: { itemID: number; data: ICreateSynthesisDTO }) => mutation.mutateAsync(data)
  };
};
