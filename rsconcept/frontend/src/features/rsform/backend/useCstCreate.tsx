import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { useUpdateTimestamp } from '@/features/library';

import { rsformsApi } from './api';
import { ICstCreateDTO } from './types';

export const useCstCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'create-cst'],
    mutationFn: rsformsApi.cstCreate,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      updateTimestamp(data.schema.id);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [KEYS.oss] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== data.schema.id
        })
      ]);
    }
  });
  return {
    cstCreate: (data: { itemID: number; data: ICstCreateDTO }) =>
      mutation.mutateAsync(data).then(response => response.new_cst)
  };
};
