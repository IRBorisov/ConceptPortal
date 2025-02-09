import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { libraryApi } from '@/features/library/backend/api';
import { ILibraryItem, LibraryItemID } from '@/features/library/models/library';
import { rsformsApi } from '@/features/rsform/backend/api';

import { ITargetOperation, ossApi } from './api';

export const useInputCreate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'input-create'],
    mutationFn: ossApi.inputCreate,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    inputCreate: (
      data: {
        itemID: LibraryItemID; //
        data: ITargetOperation;
      },
      onSuccess?: DataCallback<ILibraryItem>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.new_schema) })
  };
};
