import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type IBlockCreatedResponse,
  type IConstituentaReference,
  type ICreateBlockDTO,
  type ICreateSchemaDTO,
  type ICreateSynthesisDTO,
  type IDeleteBlockDTO,
  type IDeleteOperationDTO,
  type IImportSchemaDTO,
  type IInputCreatedResponse,
  type IMoveItemsDTO,
  type IOperationCreatedResponse,
  type IOperationSchemaDTO,
  type IOssLayout,
  type IOssLayoutDTO,
  type IRelocateConstituentsDTO,
  type ITargetOperation,
  type IUpdateBlockDTO,
  type IUpdateInputDTO,
  type IUpdateOperationDTO,
  schemaBlockCreatedResponse,
  schemaConstituentaReference,
  schemaInputCreatedResponse,
  schemaOperationCreatedResponse,
  schemaOperationSchema
} from './types';

export const ossApi = {
  baseKey: KEYS.oss,

  getOssQueryOptions: ({ itemID }: { itemID?: number }) => {
    return queryOptions({
      queryKey: KEYS.composite.ossItem({ itemID }),
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        !itemID
          ? undefined
          : axiosGet<IOperationSchemaDTO>({
              schema: schemaOperationSchema,
              endpoint: `/api/oss/${itemID}/details`,
              options: { signal: meta.signal }
            })
    });
  },

  updateLayout: ({ itemID, data, isSilent }: { itemID: number; data: IOssLayout; isSilent?: boolean }) =>
    axiosPatch<IOssLayoutDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/update-layout`,
      request: {
        data: { data: data },
        successMessage: isSilent ? undefined : infoMsg.changesSaved
      }
    }),

  createBlock: ({ itemID, data }: { itemID: number; data: ICreateBlockDTO }) =>
    axiosPost<ICreateBlockDTO, IBlockCreatedResponse>({
      schema: schemaBlockCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-block`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  updateBlock: ({ itemID, data }: { itemID: number; data: IUpdateBlockDTO }) =>
    axiosPatch<IUpdateBlockDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/update-block`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteBlock: ({ itemID, data }: { itemID: number; data: IDeleteBlockDTO }) =>
    axiosPatch<IDeleteBlockDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/delete-block`,
      request: {
        data: data,
        successMessage: infoMsg.blockDestroyed
      }
    }),

  createSchema: ({ itemID, data }: { itemID: number; data: ICreateSchemaDTO }) =>
    axiosPost<ICreateSchemaDTO, IOperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-schema`,
      request: {
        data: data,
        successMessage: response => {
          const alias = response.oss.operations.find(op => op.id === response.new_operation)?.alias;
          return infoMsg.newOperation(alias ?? 'ОШИБКА');
        }
      }
    }),
  createSynthesis: ({ itemID, data }: { itemID: number; data: ICreateSynthesisDTO }) =>
    axiosPost<ICreateSynthesisDTO, IOperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-synthesis`,
      request: {
        data: data,
        successMessage: response => {
          const alias = response.oss.operations.find(op => op.id === response.new_operation)?.alias;
          return infoMsg.newOperation(alias ?? 'ОШИБКА');
        }
      }
    }),
  importSchema: ({ itemID, data }: { itemID: number; data: IImportSchemaDTO }) =>
    axiosPost<IImportSchemaDTO, IOperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/import-schema`,
      request: {
        data: data,
        successMessage: response => {
          const alias = response.oss.operations.find(op => op.id === response.new_operation)?.alias;
          return infoMsg.newOperation(alias ?? 'ОШИБКА');
        }
      }
    }),
  updateOperation: ({ itemID, data }: { itemID: number; data: IUpdateOperationDTO }) =>
    axiosPatch<IUpdateOperationDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/update-operation`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteOperation: ({ itemID, data }: { itemID: number; data: IDeleteOperationDTO }) =>
    axiosPatch<IDeleteOperationDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/delete-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationDestroyed
      }
    }),

  createInput: ({ itemID, data }: { itemID: number; data: ITargetOperation }) =>
    axiosPatch<ITargetOperation, IInputCreatedResponse>({
      schema: schemaInputCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-input`,
      request: {
        data: data,
        successMessage: infoMsg.newLibraryItem
      }
    }),
  updateInput: ({ itemID, data }: { itemID: number; data: IUpdateInputDTO }) =>
    axiosPatch<IUpdateInputDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/set-input`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  executeOperation: ({ itemID, data }: { itemID: number; data: ITargetOperation }) =>
    axiosPost<ITargetOperation, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/execute-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationExecuted
      }
    }),

  moveItems: ({ itemID, data }: { itemID: number; data: IMoveItemsDTO }) =>
    axiosPatch<IMoveItemsDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/move-items`,
      request: {
        data: data,
        successMessage: infoMsg.moveSuccess
      }
    }),

  relocateConstituents: (data: IRelocateConstituentsDTO) =>
    axiosPost<IRelocateConstituentsDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/relocate-constituents`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  getPredecessor: (cstID: number) =>
    axiosPost<{ target: number }, IConstituentaReference>({
      schema: schemaConstituentaReference,
      endpoint: '/api/oss/get-predecessor',
      request: { data: { target: cstID } }
    })
} as const;
