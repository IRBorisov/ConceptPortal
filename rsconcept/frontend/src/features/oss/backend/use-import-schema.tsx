import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IImportSchemaDTO } from './types';

export const useImportSchema = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'import-schema'],
    mutationFn: ossApi.importSchema,
    onSuccess: response => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: response.oss.id }).queryKey, response.oss);
      updateTimestamp(response.oss.id);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    importSchema: (data: { itemID: number; data: IImportSchemaDTO }) => mutation.mutateAsync(data)
  };
};
