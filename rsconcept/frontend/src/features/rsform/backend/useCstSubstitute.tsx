import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { ICstSubstitutionsDTO } from './types';

export const useCstSubstitute = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'substitute-cst'],
    mutationFn: rsformsApi.cstSubstitute,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== data.id
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    cstSubstitute: (data: { itemID: number; data: ICstSubstitutionsDTO }) => mutation.mutateAsync(data)
  };
};
