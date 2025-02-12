import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library';

import { rsformsApi } from './api';

export const useRestoreOrder = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'restore-order'],
    mutationFn: rsformsApi.restoreOrder,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);
    }
  });
  return {
    restoreOrder: (data: { itemID: number }) => mutation.mutateAsync(data)
  };
};
