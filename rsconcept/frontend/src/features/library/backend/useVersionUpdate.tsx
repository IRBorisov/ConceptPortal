import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IRSFormDTO, rsformsApi } from '@/features/rsform/backend/api';

import { IVersionUpdateDTO, libraryApi } from './api';

export const useVersionUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.versionUpdate,
    onSuccess: data => {
      client.setQueryData(
        rsformsApi.getRSFormQueryOptions({ itemID: data.item }).queryKey,
        (prev: IRSFormDTO | undefined) =>
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
    versionUpdate: (data: IVersionUpdateDTO) => mutation.mutateAsync(data)
  };
};
