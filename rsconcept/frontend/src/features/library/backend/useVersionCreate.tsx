import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { IVersionCreateDTO } from './types';
import { useUpdateTimestamp } from './useUpdateTimestamp';

export const useVersionCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'create-version'],
    mutationFn: libraryApi.versionCreate,
    onSuccess: data => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: data.schema.id }), data.schema);
      updateTimestamp(data.schema.id);
    }
  });
  return {
    versionCreate: (data: { itemID: number; data: IVersionCreateDTO }) =>
      mutation.mutateAsync(data).then(response => response.version)
  };
};
