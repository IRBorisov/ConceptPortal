import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/features/library';
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
    inputCreate: (data: { itemID: number; data: ITargetOperation }) =>
      mutation.mutateAsync(data).then(response => response.new_schema)
  };
};
