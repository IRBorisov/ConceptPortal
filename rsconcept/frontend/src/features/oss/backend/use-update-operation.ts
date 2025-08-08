import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ILibraryItem } from '@/features/library';
import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IUpdateOperationDTO } from './types';

export const useUpdateOperation = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-operation'],
    mutationFn: ossApi.updateOperation,
    onSuccess: async (data, variables) => {
      updateTimestamp(data.id, data.time_update);
      client.setQueryData(KEYS.composite.ossItem({ itemID: data.id }), data);
      const schemaID = data.operations.find(item => item.id === variables.data.target)?.result;
      if (!schemaID) {
        return;
      }
      client.setQueryData(KEYS.composite.libraryList, (prev: ILibraryItem[] | undefined) =>
        !prev
          ? undefined
          : prev.map(item =>
              item.id === schemaID ? { ...item, ...variables.data.item_data, time_update: Date() } : item
            )
      );
      await client.invalidateQueries({
        queryKey: KEYS.composite.rsItem({ itemID: schemaID })
      });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateOperation: (data: { itemID: number; data: IUpdateOperationDTO }) => mutation.mutateAsync(data)
  };
};
