import { queryOptions } from '@tanstack/react-query';

import { globalTx } from '@/i18n';

import { type ConstituentaList } from '@/features/rsform';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';

import { type ConstituentaDataDTO, type RSModelDTO, type RSModelJsonDTO, schemaRSModel } from './types';

export const rsmodelApi = {
  baseKey: KEYS.rsmodel,

  getRSModelQueryOptions: ({ itemID }: { itemID?: number | null }) => {
    return queryOptions({
      queryKey: KEYS.composite.model({ itemID }),
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<RSModelDTO>({
          schema: schemaRSModel,
          endpoint: `/api/models/${itemID}/details`,
          options: { signal: meta.signal },
          notifyOnError: false
        }),
      enabled: !!itemID
    });
  },

  setValue: ({ itemID, data }: { itemID: number; data: ConstituentaDataDTO }) =>
    axiosPost<ConstituentaDataDTO>({
      endpoint: `/api/models/${itemID}/set-value`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  uploadJson: ({ itemID, data }: { itemID: number; data: RSModelJsonDTO }) =>
    axiosPatch<RSModelJsonDTO, RSModelDTO>({
      schema: schemaRSModel,
      endpoint: `/api/models/${itemID}/load-json`,
      request: {
        data: data,
        successMessage: globalTx('tx.model.upload.success')
      }
    }),
  clearValues: ({ itemID, data }: { itemID: number; data: ConstituentaList }) =>
    axiosPost<ConstituentaList>({
      endpoint: `/api/models/${itemID}/clear-values`,
      request: {
        data: data,
        successMessage: globalTx('tx.rslang.value.reset.success')
      }
    })
} as const;
