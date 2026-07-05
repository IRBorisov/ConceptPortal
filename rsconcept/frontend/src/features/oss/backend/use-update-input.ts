import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi, updateOss } from './api';

export const useUpdateInput = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-input'],
    mutationFn: ossApi.updateInput,
    onSuccess: async data => {
      updateOss(data, client);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return { updateInput: mutation.mutateAsync };
};
