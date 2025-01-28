import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';

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
      // TODO: invalidate OSS?
    }
  });
  return {
    cstRename: (data: { itemID: LibraryItemID; data: ICstRenameDTO }) => mutation.mutate(data)
  };
};
