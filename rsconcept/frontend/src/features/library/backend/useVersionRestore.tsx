import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useVersionRestore = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'restore-version'],
    mutationFn: libraryApi.versionRestore,
    onSuccess: data => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: data.id }), data);
      return client.invalidateQueries({ queryKey: [libraryApi.baseKey] });
    }
  });
  return {
    versionRestore: (data: { versionID: number }) => mutation.mutateAsync(data)
  };
};
