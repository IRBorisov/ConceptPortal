import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type IMoveConstituentsDTO } from './types';

export const useMoveConstituents = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'move-constituents'],
    mutationFn: rsformsApi.moveConstituents,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    moveConstituents: (data: { itemID: number; data: IMoveConstituentsDTO }) => mutation.mutateAsync(data)
  };
};
