import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';

import { ICstUpdateDTO, rsformsApi } from './api';

export const useCstUpdate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'update-cst'],
    mutationFn: rsformsApi.cstUpdate,
    onSuccess: async (_, variables) => {
      updateTimestamp(variables.itemID);
      await client.invalidateQueries({
        queryKey: [rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey]
      });
      // TODO: invalidate OSS?
    }
  });
  return {
    cstUpdate: (data: { itemID: LibraryItemID; data: ICstUpdateDTO }) => mutation.mutate(data)
  };
};
