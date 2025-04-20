import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type ICreateConstituentaDTO } from './types';

export const useCreateConstituenta = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'create-cst'],
    mutationFn: rsformsApi.createConstituenta,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      updateTimestamp(data.schema.id);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.schema.id)
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createConstituenta: (data: { itemID: number; data: ICreateConstituentaDTO }) =>
      mutation.mutateAsync(data).then(response => response.new_cst)
  };
};
