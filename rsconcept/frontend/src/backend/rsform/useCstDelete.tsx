import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { ossApi } from '@/backend/oss/api';
import { LibraryItemID } from '@/models/library';
import { IConstituentaList } from '@/models/rsform';

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
    cstDelete: (
      data: {
        itemID: LibraryItemID; //
        data: IConstituentaList;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
