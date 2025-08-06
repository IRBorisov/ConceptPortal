import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { ossApi } from './api';
import { type IDeleteReplicaDTO } from './types';

export const useDeleteReplica = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'delete-replica'],
    mutationFn: ossApi.deleteReplica,
    onSuccess: async (data, variables) => {
      if (variables.beforeUpdate) {
        variables.beforeUpdate();
        await new Promise(resolve => setTimeout(resolve, PARAMETER.minimalTimeout));
      }
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    deleteReplica: (data: { itemID: number; data: IDeleteReplicaDTO; beforeUpdate?: () => void }) => {
      mutation.mutate(data);
    }
  };
};
