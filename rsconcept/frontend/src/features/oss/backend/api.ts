import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type BlockCreatedResponse,
  type CloneSchemaDTO,
  type ConstituentaReference,
  type CreateBlockDTO,
  type CreateReplicaDTO,
  type CreateSchemaDTO,
  type CreateSynthesisDTO,
  type DeleteBlockDTO,
  type DeleteOperationDTO,
  type DeleteReplicaDTO,
  type ImportSchemaDTO,
  type InputCreatedResponse,
  type IOssLayoutDTO,
  type MoveItemsDTO,
  type OperationCreatedResponse,
  type OperationSchemaDTO,
  type OssLayout,
  type RelocateConstituentsDTO,
  schemaBlockCreatedResponse,
  schemaConstituentaReference,
  schemaInputCreatedResponse,
  schemaOperationCreatedResponse,
  schemaOperationSchema,
  type TargetOperation,
  type UpdateBlockDTO,
  type UpdateInputDTO,
  type UpdateOperationDTO
} from './types';

export const ossApi = {
  baseKey: KEYS.oss,

  getOssQueryOptions: ({ itemID }: { itemID?: number; }) => {
    return queryOptions({
      queryKey: KEYS.composite.ossItem({ itemID }),
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<OperationSchemaDTO>({
          schema: schemaOperationSchema,
          endpoint: `/api/oss/${itemID}/details`,
          options: { signal: meta.signal }
        }),
      enabled: !!itemID
    });
  },

  updateLayout: ({ itemID, data, isSilent }: { itemID: number; data: OssLayout; isSilent?: boolean; }) =>
    axiosPatch<IOssLayoutDTO, OperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/update-layout`,
      request: {
        data: { data: data },
        successMessage: isSilent ? undefined : infoMsg.changesSaved
      }
    }),

  createBlock: ({ itemID, data }: { itemID: number; data: CreateBlockDTO; }) =>
    axiosPost<CreateBlockDTO, BlockCreatedResponse>({
      schema: schemaBlockCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-block`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  updateBlock: ({ itemID, data }: { itemID: number; data: UpdateBlockDTO; }) =>
    axiosPatch<UpdateBlockDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/update-block`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteBlock: ({ itemID, data }: { itemID: number; data: DeleteBlockDTO; beforeUpdate?: () => void; }) =>
    axiosPatch<DeleteBlockDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/delete-block`,
      request: {
        data: data,
        successMessage: infoMsg.blockDestroyed
      }
    }),

  createReplica: ({ itemID, data }: { itemID: number; data: CreateReplicaDTO; }) =>
    axiosPost<CreateReplicaDTO, OperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-replica`,
      request: {
        data: data,
        successMessage: response => {
          const alias = response.oss.operations.find(op => op.id === response.new_operation)?.alias;
          return infoMsg.newOperation(alias ?? 'ОШИБКА');
        }
      }
    }),
  deleteReplica: ({ itemID, data }: { itemID: number; data: DeleteReplicaDTO; beforeUpdate?: () => void; }) =>
    axiosPatch<DeleteReplicaDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/delete-replica`,
      request: {
        data: data,
        successMessage: infoMsg.operationDestroyed
      }
    }),

  createSchema: ({ itemID, data }: { itemID: number; data: CreateSchemaDTO; }) =>
    axiosPost<CreateSchemaDTO, OperationCreatedResponse>({
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
  cloneSchema: ({ itemID, data }: { itemID: number; data: CloneSchemaDTO; }) =>
    axiosPost<CloneSchemaDTO, OperationCreatedResponse>({
      schema: schemaOperationCreatedResponse,
      endpoint: `/api/oss/${itemID}/clone-schema`,
      request: {
        data: data,
        successMessage: response => {
          const alias = response.oss.operations.find(op => op.id === response.new_operation)?.alias;
          return infoMsg.newOperation(alias ?? 'ОШИБКА');
        }
      }
    }),
  createSynthesis: ({ itemID, data }: { itemID: number; data: CreateSynthesisDTO; }) =>
    axiosPost<CreateSynthesisDTO, OperationCreatedResponse>({
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
  importSchema: ({ itemID, data }: { itemID: number; data: ImportSchemaDTO; }) =>
    axiosPost<ImportSchemaDTO, OperationCreatedResponse>({
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
  updateOperation: ({ itemID, data }: { itemID: number; data: UpdateOperationDTO; }) =>
    axiosPatch<UpdateOperationDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/update-operation`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  deleteOperation: ({ itemID, data }: { itemID: number; data: DeleteOperationDTO; beforeUpdate?: () => void; }) =>
    axiosPatch<DeleteOperationDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/delete-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationDestroyed
      }
    }),

  createInput: ({ itemID, data }: { itemID: number; data: TargetOperation; }) =>
    axiosPatch<TargetOperation, InputCreatedResponse>({
      schema: schemaInputCreatedResponse,
      endpoint: `/api/oss/${itemID}/create-input`,
      request: {
        data: data,
        successMessage: infoMsg.newLibraryItem
      }
    }),
  updateInput: ({ itemID, data }: { itemID: number; data: UpdateInputDTO; }) =>
    axiosPatch<UpdateInputDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/set-input`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  executeOperation: ({ itemID, data }: { itemID: number; data: TargetOperation; }) =>
    axiosPost<TargetOperation, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/execute-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationExecuted
      }
    }),

  moveItems: ({ itemID, data }: { itemID: number; data: MoveItemsDTO; }) =>
    axiosPatch<MoveItemsDTO, OperationSchemaDTO>({
      schema: schemaOperationSchema,
      endpoint: `/api/oss/${itemID}/move-items`,
      request: {
        data: data,
        successMessage: infoMsg.moveSuccess
      }
    }),

  relocateConstituents: ({ itemID, data }: { itemID: number; data: RelocateConstituentsDTO; }) =>
    axiosPost<RelocateConstituentsDTO>({
      endpoint: `/api/oss/${itemID}/relocate-constituents`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  getPredecessor: (cstID: number) =>
    axiosPost<{ target: number; }, ConstituentaReference>({
      schema: schemaConstituentaReference,
      endpoint: '/api/oss/get-predecessor',
      request: { data: { target: cstID } }
    })
} as const;
