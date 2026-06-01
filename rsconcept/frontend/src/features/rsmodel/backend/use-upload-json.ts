import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@rsconcept/domain/library';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsmodelApi } from './api';

export const useUploadRSModelJson = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsmodelApi.baseKey, 'load-json'],
    mutationFn: rsmodelApi.uploadJson,
    onSuccess: data => {
      client.setQueryData(KEYS.composite.model({ itemID: data.id }), data);
      client.setQueryData(KEYS.composite.libraryList, (prev: LibraryItem[] | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );
      updateTimestamp(data.id, new Date(Date.now()).toISOString());
    },
    onError: () => client.invalidateQueries()
  });
  return {
    uploadJson: mutation.mutateAsync
  };
};
