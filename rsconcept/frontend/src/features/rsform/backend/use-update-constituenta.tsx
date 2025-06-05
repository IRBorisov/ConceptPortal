import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type IUpdateConstituentaDTO } from './types';

export const useUpdateConstituenta = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'update-constituenta'],
    mutationFn: rsformsApi.updateConstituenta,
    onSuccess: async (_, variables) => {
      updateTimestamp(variables.itemID);

      await Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateConstituenta: (data: { itemID: number; data: IUpdateConstituentaDTO }) => mutation.mutateAsync(data)
  };
};
