import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { type RSForm } from '@/domain/library';

import { libraryApi } from './api';

export const useDeleteVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.deleteVersion,
    onSuccess: (_, variables) => {
      client.setQueryData(KEYS.composite.schema({ itemID: variables.itemID }), (prev: RSForm | undefined) =>
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
  return { deleteVersion: mutation.mutateAsync };
};
