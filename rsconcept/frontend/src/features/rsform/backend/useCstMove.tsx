import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { ICstMoveDTO } from './types';

export const useCstMove = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'move-cst'],
    mutationFn: rsformsApi.cstMove,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    cstMove: (data: { itemID: number; data: ICstMoveDTO }) => mutation.mutateAsync(data)
  };
};
