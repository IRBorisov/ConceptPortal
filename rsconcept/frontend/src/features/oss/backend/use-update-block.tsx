import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ILibraryItem } from '@/features/library';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IUpdateBlockDTO } from './types';

export const useUpdateBlock = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-block'],
    mutationFn: ossApi.updateBlock,
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
    updateBlock: (data: { itemID: number; data: IUpdateBlockDTO }) => mutation.mutateAsync(data)
  };
};
