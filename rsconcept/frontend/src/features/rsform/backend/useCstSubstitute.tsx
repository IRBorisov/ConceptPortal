import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/features/library/backend/useUpdateTimestamp';
import { LibraryItemID } from '@/features/library/models/library';
import { ossApi } from '@/features/oss/backend/api';
import { ICstSubstitutions } from '@/features/oss/models/oss';

import { rsformsApi } from './api';

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
        client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== data.id
        })
      ]);
    }
  });
  return {
    cstSubstitute: (data: { itemID: LibraryItemID; data: ICstSubstitutions }) => mutation.mutateAsync(data)
  };
};
