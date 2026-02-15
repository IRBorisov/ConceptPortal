import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';
import { type ConstituentaList } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';

import { rsmodelApi } from './api';

export const useClearValues = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsmodelApi.baseKey, 'clear-values'],
    mutationFn: rsmodelApi.clearValues,
    onSuccess: (_, context) => {
      updateTimestamp(context.itemID, new Date(Date.now()).toISOString());
    },
    onError: () => client.invalidateQueries()
  });
  return {
    clearValues: (data: { itemID: number; data: ConstituentaList; }) => mutation.mutateAsync(data)
  };
};
