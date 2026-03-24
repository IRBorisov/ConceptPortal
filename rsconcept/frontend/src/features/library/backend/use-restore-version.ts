import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRSForm } from '@/features/rsform/backend/api';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useRestoreVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'restore-version'],
    mutationFn: libraryApi.restoreVersion,
    onSuccess: data => {
      updateRSForm(data, client);
      return client.invalidateQueries({ queryKey: [libraryApi.baseKey] });
    },
    onError: () => client.invalidateQueries()
  });
  return { restoreVersion: mutation.mutateAsync };
};
