import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { IRSFormDTO } from '@/features/rsform/backend/types';

import { libraryApi } from './api';
import { IVersionUpdateDTO } from './types';

export const useVersionUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.versionUpdate,
    onSuccess: data => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: data.item }), (prev: IRSFormDTO | undefined) =>
        !prev
          ? undefined
          : {
              ...prev,
              versions: prev.versions.map(version =>
                version.id === data.id ? { ...version, description: data.description, version: data.version } : version
              )
            }
      );
    }
  });
  return {
    versionUpdate: (data: IVersionUpdateDTO) => mutation.mutateAsync(data)
  };
};
