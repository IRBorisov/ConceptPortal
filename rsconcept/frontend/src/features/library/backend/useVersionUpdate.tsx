import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IRSFormDTO } from '@/features/rsform/backend/types';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { IVersionUpdateDTO } from './types';

export const useVersionUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.versionUpdate,
    onSuccess: (data, variables) => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: variables.itemID }), (prev: IRSFormDTO | undefined) =>
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
    versionUpdate: (data: { itemID: number; version: IVersionUpdateDTO }) => mutation.mutateAsync(data)
  };
};
