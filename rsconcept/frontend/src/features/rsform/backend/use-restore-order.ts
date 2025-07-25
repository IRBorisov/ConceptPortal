import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';

export const useRestoreOrder = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'restore-order'],
    mutationFn: rsformsApi.restoreOrder,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    restoreOrder: (data: { itemID: number }) => mutation.mutateAsync(data)
  };
};
