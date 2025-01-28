import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rsformsApi } from '@/backend/rsform/api';
import { IVersionData, VersionID } from '@/models/library';
import { IRSFormData } from '@/models/rsform';

import { libraryApi } from './api';

export const useVersionUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.versionUpdate,
    onSuccess: data => {
      client.setQueryData(
        rsformsApi.getRSFormQueryOptions({ itemID: data.item }).queryKey,
        (prev: IRSFormData | undefined) =>
          !prev
            ? undefined
            : {
                ...prev,
                versions: prev.versions.map(version =>
                  version.id === data.id
                    ? { ...version, description: data.description, version: data.version }
                    : version
                )
              }
      );
    }
  });
  return {
    versionUpdate: (data: { versionID: VersionID; data: IVersionData }) => mutation.mutate(data)
  };
};
