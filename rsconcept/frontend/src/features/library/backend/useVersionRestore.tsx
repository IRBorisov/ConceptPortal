import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/features/rsform/backend/api';

import { VersionID } from '../models/library';
import { libraryApi } from './api';

export const useVersionRestore = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'restore-version'],
    mutationFn: libraryApi.versionRestore,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      return client.invalidateQueries({ queryKey: [libraryApi.baseKey] });
    }
  });
  return {
    versionRestore: (data: { versionID: VersionID }) => mutation.mutateAsync(data)
  };
};
