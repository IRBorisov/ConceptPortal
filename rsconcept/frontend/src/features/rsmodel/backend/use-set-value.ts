import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsmodelApi } from './api';

export const useSetValue = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsmodelApi.baseKey, 'clear-values'],
    mutationFn: rsmodelApi.setValue,
    onSuccess: (_, context) => {
      updateTimestamp(context.itemID, new Date(Date.now()).toISOString());
    },
    onError: () => client.invalidateQueries()
  });
  return { setCstValue: mutation.mutateAsync };
};
