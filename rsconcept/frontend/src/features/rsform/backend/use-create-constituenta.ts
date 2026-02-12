import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type CreateConstituentaDTO } from './types';

export const useCreateConstituenta = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'create-constituenta'],
    mutationFn: rsformsApi.createConstituenta,
    onSuccess: async data => {
      updateTimestamp(data.schema.id, data.schema.time_update);
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      await client.invalidateQueries({
        queryKey: [rsformsApi.baseKey],
        predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.schema.id)
      });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createConstituenta: (data: { itemID: number; data: CreateConstituentaDTO; }) =>
      mutation.mutateAsync(data).then(response => response.new_cst)
  };
};
