import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { useUpdateTimestamp } from '@/features/library';

import { rsformsApi } from './api';
import { ICstSubstitutionsDTO } from './types';

export const useCstSubstitute = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'substitute-cst'],
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
    }
  });
  return {
    cstSubstitute: (data: { itemID: number; data: ICstSubstitutionsDTO }) => mutation.mutateAsync(data)
  };
};
