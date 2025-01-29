import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { rsformsApi } from '@/backend/rsform/api';
import { LibraryItemID } from '@/models/library';

import { IInputUpdateDTO, ossApi } from './api';

export const useInputUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'input-update'],
    mutationFn: ossApi.inputUpdate,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    inputUpdate: (data: { itemID: LibraryItemID; data: IInputUpdateDTO }) => mutation.mutate(data)
  };
};
