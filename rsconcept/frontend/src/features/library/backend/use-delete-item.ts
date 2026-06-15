import { type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { libraryApi } from './api';

function deletedItemQueryKeys(target: number) {
  return [
    KEYS.composite.model({ itemID: target }),
    KEYS.composite.schema({ itemID: target }),
    KEYS.composite.oss({ itemID: target })
  ];
}

/** Stop and drop cache for a deleted library item without refetching it. */
async function dropDeletedItemQueries(client: QueryClient, target: number) {
  for (const queryKey of deletedItemQueryKeys(target)) {
    await client.cancelQueries({ queryKey });
    client.removeQueries({ queryKey, type: 'inactive' });
  }
}

export const useDeleteItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'delete-item'],
    mutationFn: libraryApi.deleteItem,
    onSuccess: async (_, variables) => {
      await Promise.all(deletedItemQueryKeys(variables.target).map(queryKey => client.cancelQueries({ queryKey })));
      await client.invalidateQueries({ queryKey: libraryApi.libraryListKey });
      await Promise.resolve(variables.beforeInvalidate?.());
      setTimeout(function refreshRelatedQueries() {
        void client.invalidateQueries({ queryKey: [KEYS.oss] });
        void dropDeletedItemQueries(client, variables.target);
      }, PARAMETER.refreshTimeout);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    deleteItem: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};
