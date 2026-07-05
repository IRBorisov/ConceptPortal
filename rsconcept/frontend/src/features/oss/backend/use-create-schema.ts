import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi, updateOss } from './api';

export const useCreateSchema = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-schema'],
    mutationFn: ossApi.createSchema,
    onSuccess: async data => {
      updateOss(data.oss, client);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return { createSchema: mutation.mutateAsync };
};
