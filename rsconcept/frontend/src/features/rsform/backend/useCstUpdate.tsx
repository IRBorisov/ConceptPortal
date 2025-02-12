import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library';
import { ossApi } from '@/features/oss/backend/api';

import { ICstUpdateDTO, rsformsApi } from './api';

export const useCstUpdate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'update-cst'],
    mutationFn: rsformsApi.cstUpdate,
    onSuccess: (_, variables) => {
      updateTimestamp(variables.itemID);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    cstUpdate: (data: { itemID: number; data: ICstUpdateDTO }) => mutation.mutateAsync(data)
  };
};
