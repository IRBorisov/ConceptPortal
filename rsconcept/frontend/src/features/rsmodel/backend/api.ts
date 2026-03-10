import { queryOptions } from '@tanstack/react-query';

import { type ConstituentaList } from '@/features/rsform';

import { axiosGet, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type ConstituentaDataDTO,
  type RSModelDTO,
  schemaRSModel,
} from './types';

export const rsmodelApi = {
  baseKey: KEYS.rsmodel,

  getRSModelQueryOptions: ({ itemID }: { itemID?: number | null; }) => {
    return queryOptions({
      queryKey: KEYS.composite.modelItem({ itemID }),
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

  setValue: ({ itemID, data }: { itemID: number; data: ConstituentaDataDTO; }) =>
    axiosPost<ConstituentaDataDTO>({
      endpoint: `/api/models/${itemID}/set-value`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  clearValues: ({ itemID, data }: { itemID: number; data: ConstituentaList; }) =>
    axiosPost<ConstituentaList>({
      endpoint: `/api/models/${itemID}/clear-values`,
      request: {
        data: data,
        successMessage: infoMsg.dataCleared(data.items.length)
      }
    }),
  resetModel: ({ itemID }: { itemID: number; }) =>
    axiosPost<undefined>({
      endpoint: `/api/models/${itemID}/reset-all`,
      request: { successMessage: infoMsg.modelCleared }
    }),
} as const;
