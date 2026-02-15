import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type Attribution,
  type AttributionTargetDTO,
  type ConstituentaCreatedResponse,
  type ConstituentaList,
  type CreateConstituentaDTO,
  type InlineSynthesisDTO,
  type MoveConstituentsDTO,
  type ProduceStructureResponse,
  type RSFormDTO,
  type RSFormUploadDTO,
  schemaConstituentaCreatedResponse,
  schemaProduceStructureResponse,
  schemaRSForm,
  type SubstitutionsDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from './types';

export const rsformsApi = {
  baseKey: KEYS.rsform,

  getRSFormQueryOptions: ({ itemID, version }: { itemID?: number | null; version?: number; }) => {
    return queryOptions({
      queryKey: KEYS.composite.rsItem({ itemID, version }),
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<RSFormDTO>({
          schema: schemaRSForm,
          endpoint: version ? `/api/library/${itemID}/versions/${version}` : `/api/rsforms/${itemID}/details`,
          options: { signal: meta.signal }
        }),
      enabled: !!itemID
    });
  },

  download: ({ itemID, version }: { itemID: number; version?: number; }) =>
    axiosGet<Blob>({
      endpoint: version ? `/api/versions/${version}/export-file` : `/api/rsforms/${itemID}/export-trs`,
      options: { responseType: 'blob' }
    }),
  upload: ({ itemID, data }: { itemID: number; data: RSFormUploadDTO; }) =>
    axiosPatch<RSFormUploadDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/load-trs`,
      request: {
        data: data,
        successMessage: infoMsg.uploadSuccess
      },
      options: {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    }),

  createConstituenta: ({ itemID, data }: { itemID: number; data: CreateConstituentaDTO; }) =>
    axiosPost<CreateConstituentaDTO, ConstituentaCreatedResponse>({
      schema: schemaConstituentaCreatedResponse,
      endpoint: `/api/rsforms/${itemID}/create-cst`,
      request: {
        data: data,
        successMessage: response => infoMsg.newConstituent(response.new_cst.alias)
      }
    }),
  updateConstituenta: ({ itemID, data }: { itemID: number; data: UpdateConstituentaDTO; }) =>
    axiosPatch<UpdateConstituentaDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/update-cst`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  updateCrucial: ({ itemID, data }: { itemID: number; data: UpdateCrucialDTO; }) =>
    axiosPatch<UpdateCrucialDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/update-crucial`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteConstituents: ({ itemID, data }: { itemID: number; data: ConstituentaList; }) =>
    axiosPatch<ConstituentaList, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/delete-multiple-cst`,
      request: {
        data: data,
        successMessage: infoMsg.constituentsDestroyed(data.items.length)
      }
    }),
  substituteConstituents: ({ itemID, data }: { itemID: number; data: SubstitutionsDTO; }) =>
    axiosPatch<SubstitutionsDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/substitute`,
      request: {
        data: data,
        successMessage: infoMsg.substituteSingle
      }
    }),
  moveConstituents: ({ itemID, data }: { itemID: number; data: MoveConstituentsDTO; }) =>
    axiosPatch<MoveConstituentsDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/move-cst`,
      request: { data: data }
    }),

  produceStructure: ({ itemID, cstID }: { itemID: number; cstID: number; }) =>
    axiosPatch<{ target: number; }, ProduceStructureResponse>({
      schema: schemaProduceStructureResponse,
      endpoint: `/api/rsforms/${itemID}/produce-structure`,
      request: {
        data: { target: cstID },
        successMessage: response => infoMsg.addedConstituents(response.cst_list.length)
      }
    }),
  inlineSynthesis: (data: InlineSynthesisDTO) =>
    axiosPatch<InlineSynthesisDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/inline-synthesis`,
      request: {
        data: data,
        successMessage: infoMsg.inlineSynthesisComplete
      }
    }),
  restoreOrder: ({ itemID }: { itemID: number; }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/restore-order`,
      request: { successMessage: infoMsg.reorderComplete }
    }),
  resetAliases: ({ itemID }: { itemID: number; }) =>
    axiosPatch<undefined, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/reset-aliases`,
      request: { successMessage: infoMsg.reindexComplete }
    }),

  createAttribution: ({ itemID, data }: { itemID: number; data: Attribution; }) =>
    axiosPost<Attribution, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/create-attribution`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteAttribution: ({ itemID, data }: { itemID: number; data: Attribution; }) =>
    axiosPatch<Attribution, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/delete-attribution`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  clearAttributions: ({ itemID, data }: { itemID: number; data: AttributionTargetDTO; }) =>
    axiosPatch<AttributionTargetDTO, RSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/clear-attributions`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    })
} as const;
