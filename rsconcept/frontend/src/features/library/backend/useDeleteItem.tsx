import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { libraryApi } from './api';

export const useDeleteItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'delete-item'],
    mutationFn: libraryApi.deleteItem,
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: libraryApi.libraryListKey }).catch(console.error);
      setTimeout(
        () =>
          void Promise.allSettled([
            client.invalidateQueries({ queryKey: [KEYS.oss] }),
            client.resetQueries({ queryKey: KEYS.composite.rsItem({ itemID: variables }) }),
            client.resetQueries({ queryKey: KEYS.composite.ossItem({ itemID: variables }) })
          ]).catch(console.error),
        PARAMETER.navigationDuration
      );
    }
  });
  return {
    deleteItem: (target: number) => mutation.mutateAsync(target),
    isPending: mutation.isPending
  };
};
