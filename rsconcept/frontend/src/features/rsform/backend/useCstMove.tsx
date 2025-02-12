import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library';

import { ICstMoveDTO, rsformsApi } from './api';

export const useCstMove = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'move-cst'],
    mutationFn: rsformsApi.cstMove,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);
    }
  });
  return {
    cstMove: (data: { itemID: number; data: ICstMoveDTO }) => mutation.mutateAsync(data)
  };
};
