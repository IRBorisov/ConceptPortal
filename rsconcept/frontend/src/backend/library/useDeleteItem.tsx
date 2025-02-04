import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from '@/backend/oss/api';
import { rsformsApi } from '@/backend/rsform/api';
import { LibraryItemID } from '@/models/library';
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
            client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
            client.resetQueries({ queryKey: rsformsApi.getRSFormQueryOptions({ itemID: variables }).queryKey }),
            client.resetQueries({ queryKey: ossApi.getOssQueryOptions({ itemID: variables }).queryKey })
          ]).catch(console.error),
        PARAMETER.navigationDuration
      );
    }
  });
  return {
    deleteItem: (
      target: LibraryItemID, //
      onSuccess?: () => void
    ) => mutation.mutate(target, { onSuccess }),
    isPending: mutation.isPending
  };
};
