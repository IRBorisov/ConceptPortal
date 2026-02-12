import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type MoveItemsDTO } from './types';

export const useMoveItems = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'move-items'],
    mutationFn: ossApi.moveItems,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    moveItems: (data: { itemID: number; data: MoveItemsDTO; }) => mutation.mutateAsync(data)
  };
};
