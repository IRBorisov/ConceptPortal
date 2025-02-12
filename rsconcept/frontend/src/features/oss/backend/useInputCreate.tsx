import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { ITargetOperation } from './types';

export const useInputCreate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'input-create'],
    mutationFn: ossApi.inputCreate,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: KEYS.composite.libraryList }),
        client.invalidateQueries({ queryKey: [KEYS.rsform] })
      ]);
    }
  });
  return {
    inputCreate: (data: { itemID: number; data: ITargetOperation }) =>
      mutation.mutateAsync(data).then(response => response.new_schema)
  };
};
