import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { LibraryItemID } from '@/models/library';

import { IInputUpdateDTO, ossApi } from './api';

export const useInputUpdate = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'input-update'],
    mutationFn: ossApi.inputUpdate,
    onSuccess: async data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      await client.invalidateQueries({ queryKey: [libraryApi.libraryListKey] });
    }
  });
  return {
    inputUpdate: (data: { itemID: LibraryItemID; data: IInputUpdateDTO }) => mutation.mutate(data)
  };
};
