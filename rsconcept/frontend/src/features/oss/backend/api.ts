import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type IConstituentaReference,
  type ICstRelocateDTO,
  type IInputCreatedResponse,
  type IInputUpdateDTO,
  type IOperationCreatedResponse,
  type IOperationCreateDTO,
  type IOperationDeleteDTO,
  type IOperationPosition,
  type IOperationSchemaDTO,
  type IOperationUpdateDTO,
  type ITargetOperation,
  schemaConstituentaReference,
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

  updatePositions: ({
    itemID,
    positions,
    isSilent
  }: {
    itemID: number;
    positions: IOperationPosition[];
    isSilent?: boolean;
  }) =>
    axiosPatch({
      endpoint: `/api/oss/${itemID}/update-positions`,
      request: {
        data: { positions: positions },
        successMessage: isSilent ? undefined : infoMsg.changesSaved
      }
    }),

  operationCreate: ({ itemID, data }: { itemID: number; data: IOperationCreateDTO }) =>
    axiosPost<IOperationCreateDTO, IOperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-operation`,
      request: {
        data: data,
        successMessage: response => infoMsg.newOperation(response.new_operation.alias)
      }
    }),
  operationDelete: ({ itemID, data }: { itemID: number; data: IOperationDeleteDTO }) =>
    axiosPatch<IOperationDeleteDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/delete-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationDestroyed
      }
    }),
  inputCreate: ({ itemID, data }: { itemID: number; data: ITargetOperation }) =>
    axiosPatch<ITargetOperation, IInputCreatedResponse>({
      endpoint: `/api/oss/${itemID}/create-input`,
      request: {
        data: data,
        successMessage: infoMsg.newLibraryItem
      }
    }),
  inputUpdate: ({ itemID, data }: { itemID: number; data: IInputUpdateDTO }) =>
    axiosPatch<IInputUpdateDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/set-input`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  operationUpdate: ({ itemID, data }: { itemID: number; data: IOperationUpdateDTO }) =>
    axiosPatch<IOperationUpdateDTO, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/update-operation`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  operationExecute: ({ itemID, data }: { itemID: number; data: ITargetOperation }) =>
    axiosPost<ITargetOperation, IOperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/execute-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationExecuted
      }
    }),

  relocateConstituents: (data: ICstRelocateDTO) =>
    axiosPost<ICstRelocateDTO, IOperationSchemaDTO>({
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
