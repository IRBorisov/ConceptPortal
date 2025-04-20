import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type IConstituentaReference,
  type ICreateOperationDTO,
  type IDeleteOperationDTO,
  type IInputCreatedResponse,
  type IOperationCreatedResponse,
  type IOperationSchemaDTO,
  type IOssLayout,
  type IRelocateConstituentsDTO,
  type ITargetOperation,
  type IUpdateInputDTO,
  type IUpdateOperationDTO,
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
    axiosPatch({
      endpoint: `/api/oss/${itemID}/update-layout`,
      request: {
        data: data,
        successMessage: isSilent ? undefined : infoMsg.changesSaved
      }
    }),

  createOperation: ({ itemID, data }: { itemID: number; data: ICreateOperationDTO }) =>
    axiosPost<ICreateOperationDTO, IOperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-operation`,
      request: {
        data: data,
        successMessage: response => infoMsg.newOperation(response.new_operation.alias)
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
  updateOperation: ({ itemID, data }: { itemID: number; data: IUpdateOperationDTO }) =>
    axiosPatch<IUpdateOperationDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/update-operation`,
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
};
