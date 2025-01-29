import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { ossApi } from '@/backend/oss/api';
import { LibraryItemID } from '@/models/library';

import { ICstUpdateDTO, rsformsApi } from './api';

export const useCstUpdate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'update-cst'],
    mutationFn: rsformsApi.cstUpdate,
    onSuccess: (newCst, variables) => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey, prev =>
        !prev
          ? undefined
          : {
              ...prev,
              items: prev.items.map(item => (item.id === newCst.id ? { ...item, ...newCst } : item))
            }
      );
      updateTimestamp(variables.itemID);

      return Promise.allSettled([
        client.invalidateQueries({ queryKey: [ossApi.baseKey] }),
        client.invalidateQueries({
          queryKey: [rsformsApi.baseKey],
          predicate: query => query.queryKey.length > 2 && query.queryKey[2] !== variables.itemID
        })
      ]);
    }
  });
  return {
    cstUpdate: (data: { itemID: LibraryItemID; data: ICstUpdateDTO }) => mutation.mutate(data)
  };
};
