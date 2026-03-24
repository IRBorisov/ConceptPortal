import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi, updateRSForm } from './api';

export const useRestoreOrder = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'restore-order'],
    mutationFn: rsformsApi.restoreOrder,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      updateRSForm(data, client);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    restoreOrder: mutation.mutateAsync
  };
};
