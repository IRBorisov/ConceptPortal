import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/features/library/backend/api';
import { LibraryItemID } from '@/features/library/models/library';
import { rsformsApi } from '@/features/rsform/backend/api';

import { ITargetOperation, ossApi } from './api';

export const useOperationExecute = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-execute'],
    mutationFn: ossApi.operationExecute,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    operationExecute: (data: { itemID: LibraryItemID; data: ITargetOperation }) => mutation.mutate(data)
  };
};
