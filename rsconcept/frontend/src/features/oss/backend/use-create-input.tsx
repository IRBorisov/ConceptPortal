import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ITargetOperation } from './types';

export const useCreateInput = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-input'],
    mutationFn: ossApi.createInput,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createInput: (data: { itemID: number; data: ITargetOperation }) =>
      mutation.mutateAsync(data).then(response => response.new_schema)
  };
};
