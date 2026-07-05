import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { ossApi, updateOss } from './api';

export const useDeleteReplica = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'delete-replica'],
    mutationFn: ossApi.deleteReplica,
    onSuccess: async (data, variables) => {
      if (variables.beforeUpdate) {
        variables.beforeUpdate();
        await new Promise(resolve => setTimeout(resolve, PARAMETER.minimalTimeout));
      }
      updateOss(data, client);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return { deleteReplica: mutation.mutateAsync };
};
