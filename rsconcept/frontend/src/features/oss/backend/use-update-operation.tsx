import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ILibraryItem } from '@/features/library';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IUpdateOperationDTO } from './types';

export const useUpdateOperation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'operation-update'],
    mutationFn: ossApi.updateOperation,
    onSuccess: (data, variables) => {
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
      return client.invalidateQueries({
        queryKey: KEYS.composite.rsItem({ itemID: schemaID })
      });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateOperation: (data: { itemID: number; data: IUpdateOperationDTO }) => mutation.mutateAsync(data)
  };
};
