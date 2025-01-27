import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { IRSFormData } from '@/models/rsform';

import { IRSFormCloneDTO, libraryApi } from './api';

export const useCloneItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'clone-item'],
    mutationFn: libraryApi.cloneItem,
    onSuccess: async () => await client.invalidateQueries({ queryKey: [libraryApi.baseKey] })
  });
  return {
    cloneItem: (
      data: IRSFormCloneDTO, //
      onSuccess?: DataCallback<IRSFormData>
    ) => mutation.mutate(data, { onSuccess })
  };
};
