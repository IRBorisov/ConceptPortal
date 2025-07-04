import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IUpdateInputDTO } from './types';

export const useUpdateInput = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-input'],
    mutationFn: ossApi.updateInput,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateInput: (data: { itemID: number; data: IUpdateInputDTO }) => mutation.mutateAsync(data)
  };
};
