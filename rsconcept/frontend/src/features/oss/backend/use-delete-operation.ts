import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { ossApi } from './api';
import { type IDeleteOperationDTO } from './types';

export const useDeleteOperation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'delete-operation'],
    mutationFn: ossApi.deleteOperation,
    onSuccess: async (data, variables) => {
      if (variables.beforeUpdate) {
        variables.beforeUpdate();
        await new Promise(resolve => setTimeout(resolve, PARAMETER.minimalTimeout));
      }
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    deleteOperation: (data: { itemID: number; data: IDeleteOperationDTO; beforeUpdate?: () => void }) => {
      mutation.mutate(data);
    }
  };
};
