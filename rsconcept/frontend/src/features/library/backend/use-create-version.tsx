import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { type ICreateVersionDTO } from './types';
import { useUpdateTimestamp } from './use-update-timestamp';

export const useCreateVersion = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-version'],
    mutationFn: libraryApi.createVersion,
    onSuccess: data => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: data.schema.id }), data.schema);
      updateTimestamp(data.schema.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createVersion: (data: { itemID: number; data: ICreateVersionDTO }) =>
      mutation.mutateAsync(data).then(response => response.version)
  };
};
