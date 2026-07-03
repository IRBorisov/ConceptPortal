import { type QueryClient, queryOptions } from '@tanstack/react-query';
import equal from 'fast-deep-equal';

import { globalTx } from '@/i18n';
import { type Attribution, type RSForm } from '@rsconcept/domain/library';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { queryClient } from '@/backend/query-client';

import { loadRSForm } from './rsform-loader';
import {
  type AttributionTargetDTO,
  type ConstituentaCreatedResponse,
  type ConstituentaList,
  type ConstituentsCreatedResponse,
  type CreateConstituentaDTO,
  type CreateConstituentsBatchDTO,
  type InlineSynthesisDTO,
  type MoveConstituentsDTO,
  type RSFormDTO,
  type RSFormImportJsonDTO,
  type RSFormUploadDTO,
  schemaConstituentaCreatedResponse,
  schemaConstituentsCreatedResponse,
  schemaRSForm,
  type SubstitutionsDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from './types';

export function updateRSForm(data: RSFormDTO, client: QueryClient) {
  const queryKey = rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey;
  client.setQueryData(queryKey, old => {
    if (!old || equal(old.raw, data)) {
      return old;
    }
    return { raw: data, transformed: loadRSForm(data) };
  });
}

export const rsformsApi = {
  baseKey: KEYS.rsform,

  getRSFormQueryOptions: ({ itemID, version }: { itemID?: number | null; version?: number }) => {
    const queryKey = KEYS.composite.schema({ itemID, version });
    return queryOptions({
      queryKey: queryKey,
      staleTime: DELAYS.staleShort,
      queryFn: async meta => {
        const raw = await axiosGet<RSFormDTO>({
          schema: schemaRSForm,
          endpoint: version ? `/api/library/${itemID}/versions/${version}` : `/api/rsforms/${itemID}/details`,
          options: { signal: meta.signal },
          notifyOnError: false
        });
        const previous = queryClient.getQueryData<{ raw: RSFormDTO; transformed: RSForm }>(queryKey);
        if (previous && equal(previous.raw, raw)) {
          return previous;
        }
        return { raw, transformed: loadRSForm(raw) };
      },
      enabled: !!itemID
    });
  },

  upload: ({ itemID, data }: { itemID: number; data: RSFormUploadDTO }) =>
    axiosPatch<RSFormUploadDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/load-trs`,
      request: {
        data: data,
        successMessage: globalTx('tx.schema.upload.success')
      },
      options: {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    }),

  uploadJson: ({ itemID, data }: { itemID: number; data: RSFormImportJsonDTO }) =>
    axiosPatch<RSFormImportJsonDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/load-json`,
      request: {
        data: data,
        successMessage: globalTx('tx.schema.upload.success')
      }
    }),

  createConstituenta: ({ itemID, data }: { itemID: number; data: CreateConstituentaDTO }) =>
    axiosPost<CreateConstituentaDTO, ConstituentaCreatedResponse>({
      schema: schemaConstituentaCreatedResponse,
      endpoint: `/api/rsforms/${itemID}/create-cst`,
      request: {
        data: data,
        successMessage: response => globalTx('tx.cst.create.success', { alias: response.new_cst.alias })
      }
    }),
  createConstituentsBatch: ({ itemID, data }: { itemID: number; data: CreateConstituentsBatchDTO }) =>
    axiosPost<CreateConstituentsBatchDTO, ConstituentsCreatedResponse>({
      schema: schemaConstituentsCreatedResponse,
      endpoint: `/api/rsforms/${itemID}/create-multiple-cst`,
      request: {
        data: data,
        successMessage: response =>
          response.cst_list.length === 1
            ? globalTx('tx.cst.create.success', { alias: response.cst_list[0].alias })
            : globalTx('tx.cst.clone.success', { count: response.cst_list.length })
      }
    }),
  updateConstituenta: ({ itemID, data }: { itemID: number; data: UpdateConstituentaDTO }) =>
    axiosPatch<UpdateConstituentaDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/update-cst`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  updateCrucial: ({ itemID, data }: { itemID: number; data: UpdateCrucialDTO }) =>
    axiosPatch<UpdateCrucialDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/update-crucial`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  deleteConstituents: ({ itemID, data }: { itemID: number; data: ConstituentaList }) =>
    axiosPatch<ConstituentaList, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/delete-multiple-cst`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.delete.success')
      }
    }),
  substituteConstituents: ({ itemID, data }: { itemID: number; data: SubstitutionsDTO }) =>
    axiosPatch<SubstitutionsDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/substitute`,
      request: {
        data: data,
        successMessage: globalTx('tx.substitution.success')
      }
    }),
  moveConstituents: ({ itemID, data }: { itemID: number; data: MoveConstituentsDTO }) =>
    axiosPatch<MoveConstituentsDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/move-cst`,
      request: { data: data }
    }),

  inlineSynthesis: (data: InlineSynthesisDTO) =>
    axiosPatch<InlineSynthesisDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/inline-synthesis`,
      request: {
        data: data,
        successMessage: globalTx('tx.synthesis.inline.success')
      }
    }),
  restoreOrder: ({ itemID }: { itemID: number }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/restore-order`,
      request: { successMessage: globalTx('tx.schema.order.restore.success') }
    }),
  resetAliases: ({ itemID }: { itemID: number }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/reset-aliases`,
      request: { successMessage: globalTx('tx.schema.order.rename.success') }
    }),

  createAttribution: ({ itemID, data }: { itemID: number; data: Attribution }) =>
    axiosPost<Attribution, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/create-attribution`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  deleteAttribution: ({ itemID, data }: { itemID: number; data: Attribution }) =>
    axiosPatch<Attribution, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/delete-attribution`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  clearAttributions: ({ itemID, data }: { itemID: number; data: AttributionTargetDTO }) =>
    axiosPatch<AttributionTargetDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/clear-attributions`,
      request: {
        data: data,
        successMessage: globalTx('tx.general.changes.save.success')
      }
    })
} as const;
