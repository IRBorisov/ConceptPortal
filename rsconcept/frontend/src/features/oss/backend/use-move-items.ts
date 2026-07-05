import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi, updateOss } from './api';

export const useMoveItems = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'move-items'],
    mutationFn: ossApi.moveItems,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      updateOss(data, client);
    },
    onError: () => client.invalidateQueries()
  });
  return { moveItems: mutation.mutateAsync };
};
