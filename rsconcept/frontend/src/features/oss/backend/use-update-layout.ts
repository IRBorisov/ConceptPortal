import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';

export const useUpdateLayout = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-layout'],
    mutationFn: ossApi.updateLayout,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(KEYS.composite.oss({ itemID: data.id }), data);
    },
    onError: () => client.invalidateQueries()
  });
  return { updateLayout: mutation.mutateAsync };
};
