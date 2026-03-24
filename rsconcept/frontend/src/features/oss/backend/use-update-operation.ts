import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@/features/library';
import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';

export const useUpdateOperation = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-operation'],
    mutationFn: ossApi.updateOperation,
    onSuccess: async (data, variables) => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(KEYS.composite.oss({ itemID: data.id }), data);
      const schemaID = data.operations.find(item => item.id === variables.data.target)?.result;
      if (!schemaID) {
        return;
      }
      client.setQueryData(KEYS.composite.libraryList, (prev: LibraryItem[] | undefined) =>
        !prev
          ? undefined
          : prev.map(item =>
            item.id === schemaID ? { ...item, ...variables.data.item_data, time_update: Date() } : item
          )
      );
      await client.invalidateQueries({
        queryKey: KEYS.composite.schema({ itemID: schemaID })
      });
    },
    onError: () => client.invalidateQueries()
  });
  return { updateOperation: mutation.mutateAsync };
};
