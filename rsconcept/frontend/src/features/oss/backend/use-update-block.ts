import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@/features/library';
import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type UpdateBlockDTO } from './types';

export const useUpdateBlock = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-block'],
    mutationFn: ossApi.updateBlock,
    onSuccess: (data, variables) => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(KEYS.composite.ossItem({ itemID: data.id }), data);
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
      return client.invalidateQueries({
        queryKey: KEYS.composite.rsItem({ itemID: schemaID })
      });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateBlock: (data: { itemID: number; data: UpdateBlockDTO; }) => mutation.mutateAsync(data)
  };
};
