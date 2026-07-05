import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { PARAMETER } from '@/utils/constants';

import { ossApi, updateOss } from './api';
import { type OperationSchemaDTO } from './types';

export const useDeleteOperation = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'delete-operation'],
    mutationFn: ossApi.deleteOperation,
    onSuccess: async (data, variables) => {
      if (variables.beforeUpdate) {
        variables.beforeUpdate();
        await new Promise(resolve => setTimeout(resolve, PARAMETER.minimalTimeout));
      }
      const removedSchemaId = client
        .getQueryData<OperationSchemaDTO>(ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey)
        ?.operations.find(operation => operation.id === variables.data.target)?.result;
      updateOss(data, client, [removedSchemaId]);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
    },
    onError: () => client.invalidateQueries()
  });
  return { deleteOperation: mutation.mutateAsync };
};
