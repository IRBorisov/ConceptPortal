import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type IRSFormDTO } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useDeleteVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.deleteVersion,
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
    deleteVersion: (data: { itemID: number; versionID: number }) => mutation.mutateAsync(data)
  };
};
