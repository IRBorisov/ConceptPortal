import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';
import { LibraryItemID } from '@/features/library/models/library';
import { ossApi } from '@/features/oss/backend/api';

import { ICstRenameDTO, rsformsApi } from './api';

export const useCstRename = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'rename-cst'],
    mutationFn: rsformsApi.cstRename,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      updateTimestamp(data.schema.id);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== data.schema.id
        })
      ]);
    }
  });
  return {
    cstRename: (data: { itemID: LibraryItemID; data: ICstRenameDTO }) => mutation.mutateAsync(data)
  };
};
