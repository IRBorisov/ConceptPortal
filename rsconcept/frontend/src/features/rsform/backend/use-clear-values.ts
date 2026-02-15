import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type ConstituentaList } from './types';

export const useClearValues = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'clear-values'],
    mutationFn: rsformsApi.clearValues,
    onSuccess: (_, context) => {
      updateTimestamp(context.itemID, new Date(Date.now()).toISOString());
    },
    onError: () => client.invalidateQueries()
  });
  return {
    clearValues: (data: { itemID: number; data: ConstituentaList; }) => mutation.mutateAsync(data)
  };
};
