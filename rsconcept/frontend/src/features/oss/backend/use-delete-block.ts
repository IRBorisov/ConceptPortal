import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { ossApi } from './api';
import { type IDeleteBlockDTO } from './types';

export const useDeleteBlock = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'delete-block'],
    mutationFn: ossApi.deleteBlock,
    onSuccess: async (data, variables) => {
      if (variables.beforeUpdate) {
        variables.beforeUpdate();
        await new Promise(resolve => setTimeout(resolve, PARAMETER.minimalTimeout));
      }
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    deleteBlock: (data: { itemID: number; data: IDeleteBlockDTO; beforeUpdate?: () => void }) => {
      mutation.mutate(data);
    }
  };
};
