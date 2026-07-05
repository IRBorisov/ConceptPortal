import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type RSForm } from '@rsconcept/domain/library';

import { type OperationSchemaDTO } from '@/features/oss';
import { notifyOssSync } from '@/features/oss/backend/oss-sync';
import { type RSFormDTO } from '@/features/rsform';
import { notifySchemaSync } from '@/features/rsform/backend/schema-sync';
import { type RSModelDTO } from '@/features/rsmodel';
import { notifyModelSync } from '@/features/rsmodel/backend/model-sync';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

export const useSetEditors = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'set-location'],
    mutationFn: libraryApi.setEditors,
    onSuccess: async (_, variables) => {
      const ossKey = KEYS.composite.oss({ itemID: variables.itemID });
      const ossData: OperationSchemaDTO | undefined = client.getQueryData(ossKey);
      if (ossData) {
        client.setQueryData(ossKey, { ...ossData, editors: variables.editors });
        await Promise.allSettled(
          ossData.operations
            .map(item => {
              if (!item.result) {
                return;
              }
              const itemKey = KEYS.composite.schema({ itemID: item.result });
              return client.invalidateQueries({ queryKey: itemKey });
            })
            .filter(item => !!item)
        );
        notifyOssSync(variables.itemID);
        return;
      }

      const rsFormKey = [KEYS.rsform, 'item', variables.itemID];
      client.setQueriesData({ queryKey: rsFormKey }, (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) =>
        !prev
          ? undefined
          : {
              raw: { ...prev.raw, editors: variables.editors },
              transformed: { ...prev.transformed, editors: variables.editors }
            }
      );
      const modelKey = KEYS.composite.model({ itemID: variables.itemID });
      client.setQueryData(modelKey, (prev: RSModelDTO | undefined) =>
        !prev ? undefined : { ...prev, editors: variables.editors }
      );
      notifySchemaSync(variables.itemID);
      notifyModelSync(variables.itemID);
    },
    onError: () => client.invalidateQueries()
  });

  return {
    setEditors: mutation.mutateAsync
  };
};
