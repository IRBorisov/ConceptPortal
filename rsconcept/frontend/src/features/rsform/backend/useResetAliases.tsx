import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';

export const useResetAliases = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'reset-aliases'],
    mutationFn: rsformsApi.resetAliases,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== data.id
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    resetAliases: (data: { itemID: number }) => mutation.mutateAsync(data)
  };
};
