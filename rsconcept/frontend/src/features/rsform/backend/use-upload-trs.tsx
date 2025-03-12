import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ILibraryItem } from '@/features/library';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type IRSFormUploadDTO } from './types';

export const useUploadTRS = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'load-trs'],
    mutationFn: rsformsApi.upload,
    onSuccess: data => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: data.id }), data);
      client.setQueryData(KEYS.composite.libraryList, (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.id)
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    upload: (data: IRSFormUploadDTO) => mutation.mutateAsync(data)
  };
};
