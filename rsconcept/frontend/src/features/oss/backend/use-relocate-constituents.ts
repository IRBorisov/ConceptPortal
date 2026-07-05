import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi, refreshOss } from './api';

export const useRelocateConstituents = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'relocate-constituents'],
    mutationFn: ossApi.relocateConstituents,
    onSuccess: async (_, variables) => {
      await Promise.all([
        refreshOss(variables.itemID, client),
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return { relocateConstituents: mutation.mutateAsync };
};
