import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from '@/features/oss/backend/api';
import { rsformsApi } from '@/features/rsform/backend/api';

import { IRenameLocationDTO, libraryApi } from './api';

export const useRenameLocation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'rename-location'],
    mutationFn: libraryApi.renameLocation,
    onSuccess: () =>
      Promise.allSettled([
        client.invalidateQueries({ queryKey: [libraryApi.baseKey] }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] }),
        client.invalidateQueries({ queryKey: [ossApi.baseKey] })
      ])
  });
  return {
    renameLocation: (
      data: IRenameLocationDTO, //
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
