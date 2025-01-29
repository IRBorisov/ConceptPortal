import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { rsformsApi } from '@/backend/rsform/api';
import { LibraryItemID } from '@/models/library';

import { ICstRelocateDTO, ossApi } from './api';

export const useRelocateConstituents = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'relocate-constituents'],
    mutationFn: ossApi.relocateConstituents,
    onSuccess: data => {
      client.setQueryData(ossApi.getOssQueryOptions({ itemID: data.id }).queryKey, data);
      return Promise.allSettled([
        client.invalidateQueries({ queryKey: libraryApi.libraryListKey }),
        client.invalidateQueries({ queryKey: [rsformsApi.baseKey] })
      ]);
    }
  });
  return {
    relocateConstituents: (data: { itemID: LibraryItemID; data: ICstRelocateDTO }) => mutation.mutate(data)
  };
};
