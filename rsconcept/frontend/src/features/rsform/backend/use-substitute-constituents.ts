import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type SubstitutionsDTO } from './types';

export const useSubstituteConstituents = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'substitute-constituents'],
    mutationFn: rsformsApi.substituteConstituents,
    onSuccess: async data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }), // substitutions might have changed
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.id)
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    substituteConstituents: (data: { itemID: number; data: SubstitutionsDTO; }) => mutation.mutateAsync(data)
  };
};
