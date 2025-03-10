import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';

export const useProduceStructure = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'produce-structure'],
    mutationFn: rsformsApi.produceStructure,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      updateTimestamp(data.schema.id);

      return Promise.allSettled([
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
