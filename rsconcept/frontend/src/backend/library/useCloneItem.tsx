import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';

import { IRSFormDTO } from '../rsform/api';
import { IRSFormCloneDTO, libraryApi } from './api';

export const useCloneItem = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'clone-item'],
    mutationFn: libraryApi.cloneItem,
    onSuccess: () => client.invalidateQueries({ queryKey: [libraryApi.baseKey] })
  });
  return {
    cloneItem: (
      data: IRSFormCloneDTO, //
      onSuccess?: DataCallback<IRSFormDTO>
    ) => mutation.mutate(data, { onSuccess })
  };
};
