import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type ICstUpdateDTO } from './types';

export const useCstUpdate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'update-cst'],
    mutationFn: rsformsApi.cstUpdate,
    onSuccess: (_, variables) => {
      updateTimestamp(variables.itemID);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    cstUpdate: (data: { itemID: number; data: ICstUpdateDTO }) => mutation.mutateAsync(data)
  };
};
