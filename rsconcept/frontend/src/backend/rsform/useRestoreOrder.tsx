import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';

import { rsformsApi } from './api';

export const useRestoreOrder = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'restore-order'],
    mutationFn: rsformsApi.restoreOrder,
    onSuccess: data => {
      client.setQueryData([rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey], data);
      updateTimestamp(data.id);
    }
  });
  return {
    restoreOrder: (
      itemID: LibraryItemID, //
      onSuccess?: () => void
    ) => mutation.mutate(itemID, { onSuccess })
  };
};
