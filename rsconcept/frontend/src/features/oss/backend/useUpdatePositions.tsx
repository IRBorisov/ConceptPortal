import { useMutation } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';
import { LibraryItemID } from '@/features/library/models/library';

import { IOperationPosition, ossApi } from './api';

export const useUpdatePositions = () => {
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'update-positions'],
    mutationFn: ossApi.updatePositions,
    onSuccess: (_, variables) => updateTimestamp(variables.itemID)
  });
  return {
    updatePositions: (data: {
      itemID: LibraryItemID; //
      positions: IOperationPosition[];
      isSilent?: boolean;
    }) => mutation.mutateAsync(data)
  };
};
