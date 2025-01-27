import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { IVersionData, LibraryItemID, VersionID } from '@/models/library';
import { IRSFormData } from '@/models/rsform';

import { libraryApi } from './api';

export const useVersionUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.versionUpdate,
    onSuccess: (_, variables) => {
      client.setQueryData(
        [rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey],
        (prev: IRSFormData) => ({
          ...prev,
          versions: prev.versions.map(version =>
            version.id === variables.versionID
              ? { ...version, description: variables.data.description, version: variables.data.version }
              : version
          )
        })
      );
    }
  });
  return {
    versionUpdate: (
      data: {
        itemID: LibraryItemID; //
        versionID: VersionID;
        data: IVersionData;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
