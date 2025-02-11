import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IRSFormDTO, rsformsApi } from '@/features/rsform/backend/api';

import { LibraryItemID, VersionID } from '../models/library';
import { libraryApi } from './api';

export const useVersionDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.versionDelete,
    onSuccess: (_, variables) => {
      client.setQueryData(
        rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey,
        (prev: IRSFormDTO | undefined) =>
          !prev
            ? undefined
            : {
                ...prev,
                versions: prev.versions.filter(version => version.id !== variables.versionID)
              }
      );
    }
  });
  return {
    versionDelete: (data: { itemID: LibraryItemID; versionID: VersionID }) => mutation.mutateAsync(data)
  };
};
