import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { notifyOssSync } from './oss-sync';

export const useRelocateConstituents = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'relocate-constituents'],
    mutationFn: ossApi.relocateConstituents,
    onSuccess: async (_, variables) => {
      notifyOssSync(variables.itemID);
      await Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return { relocateConstituents: mutation.mutateAsync };
};
