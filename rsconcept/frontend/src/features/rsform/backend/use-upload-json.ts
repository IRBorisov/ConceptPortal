import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@rsconcept/domain/library';

import { KEYS } from '@/backend/configuration';

import { rsformsApi, updateRSForm } from './api';

export const useUploadRSFormJson = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'load-json'],
    mutationFn: rsformsApi.uploadJson,
    onSuccess: async data => {
      updateRSForm(data, client);
      client.setQueryData(KEYS.composite.libraryList, (prev: LibraryItem[] | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );

      await Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.id)
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    uploadJson: mutation.mutateAsync
  };
};
