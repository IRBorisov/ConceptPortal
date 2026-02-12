import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type AttributionTargetDTO } from './types';

export const useClearAttributions = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'clear-attributions'],
    mutationFn: rsformsApi.clearAttributions,
    onSuccess: async data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      await client.invalidateQueries({
        queryKey: [rsformsApi.baseKey],
        predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.id)
      });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    clearAttributions: (data: { itemID: number; data: AttributionTargetDTO; }) => mutation.mutateAsync(data)
  };
};
