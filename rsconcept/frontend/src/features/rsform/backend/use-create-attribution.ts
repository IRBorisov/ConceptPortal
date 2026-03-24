import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi, updateRSForm } from './api';

export const useCreateAttribution = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'create-attribution'],
    mutationFn: rsformsApi.createAttribution,
    onSuccess: async data => {
      updateTimestamp(data.id, data.time_update);
      updateRSForm(data, client);
      await client.invalidateQueries({
        queryKey: [rsformsApi.baseKey],
        predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.id)
      });
    },
    onError: () => client.invalidateQueries()
  });
  return { createAttribution: mutation.mutateAsync };
};
