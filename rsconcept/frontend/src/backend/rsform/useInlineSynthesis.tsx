import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { ossApi } from '@/backend/oss/api';
import { LibraryItemID } from '@/models/library';

import { IInlineSynthesisDTO, IRSFormDTO, rsformsApi } from './api';

export const useInlineSynthesis = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'inline-synthesis'],
    mutationFn: rsformsApi.inlineSynthesis,
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
    inlineSynthesis: (
      data: {
        itemID: LibraryItemID; //
        data: IInlineSynthesisDTO;
      },
      onSuccess?: DataCallback<IRSFormDTO>
    ) => mutation.mutate(data, { onSuccess })
  };
};
