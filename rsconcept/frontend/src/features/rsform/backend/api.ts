import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import { IConstituentaList, IConstituentaMeta, ITargetCst } from '../models/rsform';
import { IExpressionParse } from '../models/rslang';
import {
  ICheckConstituentaDTO,
  ICstCreatedResponse,
  ICstCreateDTO,
  ICstMoveDTO,
  ICstRenameDTO,
  ICstSubstitutionsDTO,
  ICstUpdateDTO,
  IInlineSynthesisDTO,
  IProduceStructureResponse,
  IRSFormDTO,
  IRSFormUploadDTO
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

  cstCreate: ({ itemID, data }: { itemID: number; data: ICstCreateDTO }) =>
    axiosPost<ICstCreateDTO, ICstCreatedResponse>({
      endpoint: `/api/rsforms/${itemID}/create-cst`,
      request: {
        data: data,
        successMessage: response => infoMsg.newConstituent(response.new_cst.alias)
      }
    }),
  cstUpdate: ({ itemID, data }: { itemID: number; data: ICstUpdateDTO }) =>
    axiosPatch<ICstUpdateDTO, IConstituentaMeta>({
      endpoint: `/api/rsforms/${itemID}/update-cst`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  cstDelete: ({ itemID, data }: { itemID: number; data: IConstituentaList }) =>
    axiosPatch<IConstituentaList, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/delete-multiple-cst`,
      request: {
        data: data,
        successMessage: infoMsg.constituentsDestroyed(data.items.length)
      }
    }),
  cstRename: ({ itemID, data }: { itemID: number; data: ICstRenameDTO }) =>
    axiosPatch<ICstRenameDTO, ICstCreatedResponse>({
      endpoint: `/api/rsforms/${itemID}/rename-cst`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  cstSubstitute: ({ itemID, data }: { itemID: number; data: ICstSubstitutionsDTO }) =>
    axiosPatch<ICstSubstitutionsDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/substitute`,
      request: {
        data: data,
        successMessage: infoMsg.substituteSingle
      }
    }),
  cstMove: ({ itemID, data }: { itemID: number; data: ICstMoveDTO }) =>
    axiosPatch<ICstMoveDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/move-cst`,
      request: { data: data }
    }),

  produceStructure: ({ itemID, data }: { itemID: number; data: ITargetCst }) =>
    axiosPatch<ITargetCst, IProduceStructureResponse>({
      endpoint: `/api/rsforms/${itemID}/produce-structure`,
      request: {
        data: data,
        successMessage: response => infoMsg.addedConstituents(response.cst_list.length)
      }
    }),
  inlineSynthesis: (data: IInlineSynthesisDTO) =>
    axiosPatch<IInlineSynthesisDTO, IRSFormDTO>({
      endpoint: `/api/rsforms/inline-synthesis`,
      request: {
        data: data,
        successMessage: infoMsg.inlineSynthesisComplete
      }
    }),
  restoreOrder: ({ itemID }: { itemID: number }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/restore-order`,
      request: { successMessage: infoMsg.reorderComplete }
    }),
  resetAliases: ({ itemID }: { itemID: number }) =>
    axiosPatch<undefined, IRSFormDTO>({
      endpoint: `/api/rsforms/${itemID}/reset-aliases`,
      request: { successMessage: infoMsg.reindexComplete }
    }),

  checkConstituenta: ({ itemID, data }: { itemID: number; data: ICheckConstituentaDTO }) =>
    axiosPost<ICheckConstituentaDTO, IExpressionParse>({
      endpoint: `/api/rsforms/${itemID}/check-constituenta`,
      request: { data: data }
    })
};
