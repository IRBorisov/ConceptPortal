import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from '@/features/oss/backend/api';
import { rsformsApi } from '@/features/rsform/backend/api';

import { libraryApi } from './api';

export const useSetEditors = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setEditors,
    onSuccess: (_, variables) => {
      const ossKey = ossApi.getOssQueryOptions({ itemID: variables.itemID }).queryKey;
      const ossData = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, editors: variables.editors });
        return Promise.allSettled(
          ossData.items
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = rsformsApi.getRSFormQueryOptions({ itemID: item.result }).queryKey;
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        );
      }

      const rsKey = rsformsApi.getRSFormQueryOptions({ itemID: variables.itemID }).queryKey;
      client.setQueryData(rsKey, prev => (!prev ? undefined : { ...prev, editors: variables.editors }));
    }
  });

  return {
    setEditors: (data: { itemID: number; editors: number[] }) => mutation.mutateAsync(data)
  };
};
