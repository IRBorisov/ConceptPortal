import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';
import { LibraryItemID } from '@/features/library/models/library';
import { ossApi } from '@/features/oss/backend/api';

import { IConstituentaList } from '../models/rsform';
import { rsformsApi } from './api';

export const useCstDelete = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'delete-multiple-cst'],
    mutationFn: rsformsApi.cstDelete,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);

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
    cstDelete: (data: { itemID: LibraryItemID; data: IConstituentaList }) => mutation.mutateAsync(data)
  };
};
