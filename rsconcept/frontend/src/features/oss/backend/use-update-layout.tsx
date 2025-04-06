import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { ossApi } from './api';
import { type IOperationSchemaDTO, type IOssLayout } from './types';

export const useUpdateLayout = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'update-layout'],
    mutationFn: ossApi.updateLayout,
    onSuccess: (_, variables) => {
      updateTimestamp(variables.itemID);
      client.setQueryData(
        ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey,
        (prev: IOperationSchemaDTO | undefined) =>
          !prev
            ? prev
            : {
                ...prev,
                layout: variables.data
              }
      );
    },
    onError: () => client.invalidateQueries()
  });
  return {
    updateLayout: (data: {
      itemID: number; //
      data: IOssLayout;
      isSilent?: boolean;
    }) => mutation.mutateAsync(data)
  };
};
