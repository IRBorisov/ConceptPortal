import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IRSFormDTO } from '@/features/rsform/backend/types';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useVersionDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.versionDelete,
    onSuccess: (_, variables) => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: variables.itemID }), (prev: IRSFormDTO | undefined) =>
        !prev
          ? undefined
          : {
              ...prev,
              versions: prev.versions.filter(version => version.id !== variables.versionID)
            }
      );
    },
    onError: () => client.invalidateQueries()
  });
  return {
    versionDelete: (data: { itemID: number; versionID: number }) => mutation.mutateAsync(data)
  };
};
