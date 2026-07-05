import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsmodelApi } from './api';
import { notifyModelSync } from './model-sync';

export const useSetValue = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsmodelApi.baseKey, 'set-value'],
    mutationFn: rsmodelApi.setValue,
    onSuccess: (_, context) => {
      updateTimestamp(context.itemID, new Date(Date.now()).toISOString());
      notifyModelSync(context.itemID);
    },
    onError: () => client.invalidateQueries()
  });
  return { setCstValue: mutation.mutateAsync };
};
