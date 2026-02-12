import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type UpdateCrucialDTO } from './types';

export const useUpdateCrucial = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'update-crucial'],
    mutationFn: rsformsApi.updateCrucial,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateCrucial: (data: { itemID: number; data: UpdateCrucialDTO; }) => mutation.mutateAsync(data)
  };
};
