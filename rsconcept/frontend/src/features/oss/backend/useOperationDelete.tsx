import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { IOperationDeleteDTO } from './types';

export const useOperationDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'operation-delete'],
    mutationFn: ossApi.operationDelete,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    }
  });
  return {
    operationDelete: (data: { itemID: number; data: IOperationDeleteDTO }) => mutation.mutateAsync(data)
  };
};
