import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type ICreateSchemaDTO } from './types';

export const useCreateSchema = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-schema'],
    mutationFn: ossApi.createSchema,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.oss.id }).queryKey, data.oss);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return {
    createSchema: (data: { itemID: number; data: ICreateSchemaDTO }) => mutation.mutateAsync(data)
  };
};
