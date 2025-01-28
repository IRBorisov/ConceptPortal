import { useMutation } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';
import { IOperationPosition } from '@/models/oss';

import { ossApi } from './api';

export const useUpdatePositions = () => {
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'update-positions'],
    mutationFn: ossApi.updatePositions,
    onSuccess: (_, variables) => updateTimestamp(variables.itemID)
  });
  return {
    updatePositions: (
      data: {
        itemID: LibraryItemID; //
        positions: IOperationPosition[];
        isSilent?: boolean;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
