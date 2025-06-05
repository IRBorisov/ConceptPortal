import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/use-update-timestamp';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { type IInlineSynthesisDTO } from './types';

export const useInlineSynthesis = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'inline-synthesis'],
    mutationFn: rsformsApi.inlineSynthesis,
    onSuccess: async data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);

      await Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== String(data.id)
        })
      ]);
    },
    onError: () => client.invalidateQueries()
  });
  return {
    inlineSynthesis: (data: IInlineSynthesisDTO) => mutation.mutateAsync(data)
  };
};
