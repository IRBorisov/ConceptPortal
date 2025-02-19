import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { IRenameLocationDTO } from './types';

export const useRenameLocation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'rename-location'],
    mutationFn: libraryApi.renameLocation,
    onSuccess: () =>
      Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.library] }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] }),
        client.invalidateQueries({ queryKey: [KEYS.oss] })
      ]),
    onError: () => client.invalidateQueries()
  });
  return {
    renameLocation: (data: IRenameLocationDTO) => mutation.mutateAsync(data)
  };
};
