import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';

export const useProduceStructure = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'produce-structure'],
    mutationFn: rsformsApi.produceStructure,
    onSuccess: async data => {
      updateTimestamp(data.schema.id, data.schema.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.schema.id)
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    produceStructure: (data: { itemID: number; cstID: number }) =>
      mutation.mutateAsync(data).then(response => response.cst_list)
  };
};
