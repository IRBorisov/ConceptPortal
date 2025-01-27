import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IRenameLocationDTO, libraryApi } from './api';

export const useRenameLocation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'rename-location'],
    mutationFn: libraryApi.renameLocation,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] })
  });
  return {
    renameLocation: (
      data: IRenameLocationDTO, //
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
