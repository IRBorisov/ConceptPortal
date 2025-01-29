import { useMutation, useQueryClient } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';
import { ossApi } from '@/backend/oss/api';
import { ILibraryItem } from '@/models/library';

import { IRSFormUploadDTO, rsformsApi } from './api';

export const useUploadTRS = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'load-trs'],
    mutationFn: rsformsApi.upload,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      client.setQueryData(libraryApi.libraryListKey, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== data.id
        })
      ]);
    }
  });
  return {
    upload: (data: IRSFormUploadDTO) => mutation.mutate(data)
  };
};
