import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { LibraryItemID, VersionID } from '@/models/library';
import { IRSFormData } from '@/models/rsform';

import { libraryApi } from './api';

export const useVersionDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.versionDelete,
    onSuccess: (_, variables) => {
      client.setQueryData(
        [rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey],
        (prev: IRSFormData) => ({
          ...prev,
          versions: prev.versions.filter(version => version.id !== variables.versionID)
        })
      );
    }
  });
  return {
    versionDelete: (
      data: {
        itemID: LibraryItemID; //
        versionID: VersionID;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
