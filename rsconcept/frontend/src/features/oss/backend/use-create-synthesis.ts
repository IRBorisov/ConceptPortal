import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi, updateOss } from './api';

export const useCreateSynthesis = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-synthesis'],
    mutationFn: ossApi.createSynthesis,
    onSuccess: async data => {
      updateOss(data.oss, client);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return { createSynthesis: mutation.mutateAsync };
};
