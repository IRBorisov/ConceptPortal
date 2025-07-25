import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type IRSFormDTO } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { type IUpdateVersionDTO } from './types';

export const useUpdateVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.updateVersion,
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
      client.setQueryData(
        KEYS.composite.rsItem({ itemID: variables.itemID, version: variables.version.id }),
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
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateVersion: (data: { itemID: number; version: IUpdateVersionDTO }) => mutation.mutateAsync(data)
  };
};
