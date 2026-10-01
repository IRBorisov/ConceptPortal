import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsmodelApi, updateRSModel } from './api';

export const useClearValues = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsmodelApi.baseKey, 'clear-values'],
    mutationFn: rsmodelApi.clearValues,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      updateRSModel(data, client);
    },
    onError: () => client.invalidateQueries()
  });
  return { clearValues: mutation.mutateAsync };
};
