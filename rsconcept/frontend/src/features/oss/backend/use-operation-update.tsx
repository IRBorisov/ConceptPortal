import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ILibraryItem } from '@/features/library';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IOperationUpdateDTO } from './types';

export const useOperationUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'operation-update'],
    mutationFn: ossApi.operationUpdate,
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
    operationUpdate: (data: { itemID: number; data: IOperationUpdateDTO }) => mutation.mutateAsync(data)
  };
};
