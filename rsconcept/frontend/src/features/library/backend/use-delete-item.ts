import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { libraryApi } from './api';

export const useDeleteItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'delete-item'],
    mutationFn: libraryApi.deleteItem,
    onSuccess: async (_, variables) => {
      await client.invalidateQueries({ queryKey: libraryApi.libraryListKey });
      await Promise.resolve(variables.beforeInvalidate?.());
      setTimeout(
        () =>
          void Promise.allSettled([
            client.invalidateQueries({ queryKey: [KEYS.oss] }),
            client.resetQueries({ queryKey: KEYS.composite.modelItem({ itemID: variables.target }) }),
            client.resetQueries({ queryKey: KEYS.composite.rsItem({ itemID: variables.target }) }),
            client.resetQueries({ queryKey: KEYS.composite.ossItem({ itemID: variables.target }) })
          ]),
        PARAMETER.refreshTimeout
      );
    },
    onError: () => client.invalidateQueries()
  });
  return {
    deleteItem: (
      data: { target: number; beforeInvalidate?: () => void | Promise<void>; }
    ) => mutation.mutateAsync(data),
    isPending: mutation.isPending
  };
};
