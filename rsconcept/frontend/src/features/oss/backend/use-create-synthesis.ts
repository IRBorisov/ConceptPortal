import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ICreateSynthesisDTO } from './types';

export const useCreateSynthesis = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-synthesis'],
    mutationFn: ossApi.createSynthesis,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createSynthesis: (data: { itemID: number; data: ICreateSynthesisDTO }) => mutation.mutateAsync(data)
  };
};
