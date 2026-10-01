import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsmodelApi, updateRSModel } from './api';

export const useSetValue = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsmodelApi.baseKey, 'set-value'],
    mutationFn: rsmodelApi.setValue,
    onSuccess: data => {
      updateTimestamp(data.id, data.time_update);
      updateRSModel(data, client);
    },
    onError: () => client.invalidateQueries()
  });
  return { setCstValue: mutation.mutateAsync };
};
