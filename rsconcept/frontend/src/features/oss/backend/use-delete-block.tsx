import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IDeleteBlockDTO } from './types';

export const useDeleteBlock = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'delete-block'],
    mutationFn: ossApi.deleteBlock,
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
    deleteBlock: (data: { itemID: number; data: IDeleteBlockDTO }) => mutation.mutateAsync(data)
  };
};
