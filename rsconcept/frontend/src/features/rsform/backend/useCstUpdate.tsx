import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { useUpdateTimestamp } from '@/features/library';

import { rsformsApi } from './api';
import { ICstUpdateDTO } from './types';

export const useCstUpdate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'update-cst'],
    mutationFn: rsformsApi.cstUpdate,
    onSuccess: (_, variables) => {
      updateTimestamp(variables.itemID);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    cstUpdate: (data: { itemID: number; data: ICstUpdateDTO }) => mutation.mutateAsync(data)
  };
};
