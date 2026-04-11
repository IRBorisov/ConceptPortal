import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRSForm } from '@/features/rsform/backend/api';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { type CreateVersionDTO } from './types';

export const useCreateVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'create-version'],
    mutationFn: libraryApi.createVersion,
    onSuccess: data => {
      updateRSForm(data.schema, client);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createVersion: (data: { itemID: number; data: CreateVersionDTO }) =>
      mutation.mutateAsync(data).then(response => response.version)
  };
};
