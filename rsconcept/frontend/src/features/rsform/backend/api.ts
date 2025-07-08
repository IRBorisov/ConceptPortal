import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type ICheckConstituentaDTO,
  type IConstituentaCreatedResponse,
  type IConstituentaList,
  type ICreateConstituentaDTO,
  type IExpressionParseDTO,
  type IInlineSynthesisDTO,
  type IMoveConstituentsDTO,
  type IProduceStructureResponse,
  type IRSFormDTO,
  type IRSFormUploadDTO,
  type ISubstitutionsDTO,
  type IUpdateConstituentaDTO,
  schemaConstituentaCreatedResponse,
  schemaExpressionParse,
  schemaProduceStructureResponse,
  schemaRSForm
} from './types';

export const rsformsApi = {
  baseKey: KEYS.rsform,

  getRSFormQueryOptions: ({ itemID, version }: { itemID?: number; version?: number }) => {
    return queryOptions({
      queryKey: KEYS.composite.rsItem({ itemID, version }),
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        !itemID
          ? undefined
          : axiosGet<IRSFormDTO>({
              schema: schemaRSForm,
              endpoint: version ? `/api/library/${itemID}/versions/${version}` : `/api/rsforms/${itemID}/details`,
              options: { signal: meta.signal }
            })
    });
  },

  download: ({ itemID, version }: { itemID: number; version?: number }) =>
    axiosGet<Blob>({
      endpoint: version ? `/api/versions/${version}/export-file` : `/api/rsforms/${itemID}/export-trs`,
      options: { responseType: 'blob' }
    }),
  upload: (data: IRSFormUploadDTO) =>
    axiosPatch<IRSFormUploadDTO, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${data.itemID}/load-trs`,
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

  createConstituenta: ({ itemID, data }: { itemID: number; data: ICreateConstituentaDTO }) =>
    axiosPost<ICreateConstituentaDTO, IConstituentaCreatedResponse>({
      schema: schemaConstituentaCreatedResponse,
      endpoint: `/api/rsforms/${itemID}/create-cst`,
      request: {
        data: data,
        successMessage: response => infoMsg.newConstituent(response.new_cst.alias)
      }
    }),
  updateConstituenta: ({ itemID, data }: { itemID: number; data: IUpdateConstituentaDTO }) =>
    axiosPatch<IUpdateConstituentaDTO, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/update-cst`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteConstituents: ({ itemID, data }: { itemID: number; data: IConstituentaList }) =>
    axiosPatch<IConstituentaList, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/delete-multiple-cst`,
      request: {
        data: data,
        successMessage: infoMsg.constituentsDestroyed(data.items.length)
      }
    }),
  substituteConstituents: ({ itemID, data }: { itemID: number; data: ISubstitutionsDTO }) =>
    axiosPatch<ISubstitutionsDTO, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/substitute`,
      request: {
        data: data,
        successMessage: infoMsg.substituteSingle
      }
    }),
  moveConstituents: ({ itemID, data }: { itemID: number; data: IMoveConstituentsDTO }) =>
    axiosPatch<IMoveConstituentsDTO, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/move-cst`,
      request: { data: data }
    }),

  produceStructure: ({ itemID, cstID }: { itemID: number; cstID: number }) =>
    axiosPatch<{ target: number }, IProduceStructureResponse>({
      schema: schemaProduceStructureResponse,
      endpoint: `/api/rsforms/${itemID}/produce-structure`,
      request: {
        data: { target: cstID },
        successMessage: response => infoMsg.addedConstituents(response.cst_list.length)
      }
    }),
  inlineSynthesis: (data: IInlineSynthesisDTO) =>
    axiosPatch<IInlineSynthesisDTO, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/inline-synthesis`,
      request: {
        data: data,
        successMessage: infoMsg.inlineSynthesisComplete
      }
    }),
  restoreOrder: ({ itemID }: { itemID: number }) =>
    axiosPatch<undefined, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/restore-order`,
      request: { successMessage: infoMsg.reorderComplete }
    }),
  resetAliases: ({ itemID }: { itemID: number }) =>
    axiosPatch<undefined, IRSFormDTO>({
      schema: schemaRSForm,
      endpoint: `/api/rsforms/${itemID}/reset-aliases`,
      request: { successMessage: infoMsg.reindexComplete }
    }),

  checkConstituenta: ({ itemID, data }: { itemID: number; data: ICheckConstituentaDTO }) =>
    axiosPost<ICheckConstituentaDTO, IExpressionParseDTO>({
      schema: schemaExpressionParse,
      endpoint: `/api/rsforms/${itemID}/check-constituenta`,
      request: { data: data }
    })
} as const;
