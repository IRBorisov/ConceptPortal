import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IOperationPosition } from './types';

export const useUpdatePositions = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-positions'],
    mutationFn: ossApi.updatePositions,
    onSuccess: (_, variables) => updateTimestamp(variables.itemID),
    onError: () => client.invalidateQueries()
  });
  return {
    updatePositions: (data: {
      itemID: number; //
      positions: IOperationPosition[];
      isSilent?: boolean;
    }) => mutation.mutateAsync(data)
  };
};
