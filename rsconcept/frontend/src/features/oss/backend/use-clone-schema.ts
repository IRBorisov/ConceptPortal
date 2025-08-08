import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ICloneSchemaDTO } from './types';

export const useCloneSchema = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'clone-schema'],
    mutationFn: ossApi.cloneSchema,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    cloneSchema: (data: { itemID: number; data: ICloneSchemaDTO }) => mutation.mutateAsync(data)
  };
};
