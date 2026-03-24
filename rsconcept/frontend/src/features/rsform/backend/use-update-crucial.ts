import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi, updateRSForm } from './api';

export const useUpdateCrucial = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'update-crucial'],
    mutationFn: rsformsApi.updateCrucial,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      updateRSForm(data, client);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateCrucial: mutation.mutateAsync
  };
};
