import { queryOptions } from '@tanstack/react-query';

import { formatLabel, lid } from '@/i18n';

import { type ConstituentaList } from '@/features/rsform';

import { axiosGet, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';

import { type ConstituentaDataDTO, type RSModelDTO, schemaRSModel } from './types';

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
          options: { signal: meta.signal }
        }),
      enabled: !!itemID
    });
  },

  setValue: ({ itemID, data }: { itemID: number; data: ConstituentaDataDTO }) =>
    axiosPost<ConstituentaDataDTO>({
      endpoint: `/api/models/${itemID}/set-value`,
      request: {
        data: data,
        successMessage: formatLabel(lid.info.changesSaved)
      }
    }),
  clearValues: ({ itemID, data }: { itemID: number; data: ConstituentaList }) =>
    axiosPost<ConstituentaList>({
      endpoint: `/api/models/${itemID}/clear-values`,
      request: {
        data: data,
        successMessage: formatLabel(lid.info.dataCleared, { count: data.items.length })
      }
    }),
  resetModel: ({ itemID }: { itemID: number }) =>
    axiosPost<undefined>({
      endpoint: `/api/models/${itemID}/reset-all`,
      request: { successMessage: formatLabel(lid.info.modelCleared) }
    })
} as const;
