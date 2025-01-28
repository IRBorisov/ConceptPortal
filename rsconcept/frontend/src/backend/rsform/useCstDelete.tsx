import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
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
      // TODO: invalidate OSS?
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
