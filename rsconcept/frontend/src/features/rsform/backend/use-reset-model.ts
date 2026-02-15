import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';

export const useResetModel = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'reset-model'],
    mutationFn: rsformsApi.resetModel,
    onSuccess: (_, context) => {
      updateTimestamp(context.itemID, new Date(Date.now()).toISOString());
    },
    onError: () => client.invalidateQueries()
  });
  return {
    resetModel: (data: { itemID: number; }) => mutation.mutateAsync(data)
  };
};
