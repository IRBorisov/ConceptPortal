import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { ILibraryItem, ILibraryItemData } from '@/features/library/models/library';
import { IArgument, ICstSubstituteEx, IOperation, OperationID, OperationType } from '@/features/oss/models/oss';
import { schemaCstSubstitute } from '@/features/rsform/backend/api';
import { IConstituentaReference, ITargetCst } from '@/features/rsform/models/rsform';
import { infoMsg } from '@/utils/labels';

/**
 * Represents {@link IOperation} data from server.
 */
export interface IOperationDTO extends Omit<IOperation, 'substitutions' | 'arguments'> {}

/**
 * Represents backend data for {@link IOperationSchema}.
 */
export interface IOperationSchemaDTO extends ILibraryItemData {
  items: IOperationDTO[];
  arguments: IArgument[];
  substitutions: ICstSubstituteEx[];
}

/**
 * Represents {@link IOperation} position.
 */
export const schemaOperationPosition = z.object({
  id: z.number(),
  position_x: z.number(),
  position_y: z.number()
});

/**
 * Represents {@link IOperation} position.
 */
export type IOperationPosition = z.infer<typeof schemaOperationPosition>;

/**
 * Represents {@link IOperation} data, used in creation process.
 */
export const schemaOperationCreate = z.object({
  positions: z.array(schemaOperationPosition),
  item_data: z.object({
    alias: z.string().nonempty(),
    operation_type: z.nativeEnum(OperationType),
    title: z.string(),
    comment: z.string(),
    position_x: z.number(),
    position_y: z.number(),
    result: z.number().nullable()
  }),
  arguments: z.array(z.number()),
  create_schema: z.boolean()
});

/**
 * Represents {@link IOperation} data, used in creation process.
 */
export type IOperationCreateDTO = z.infer<typeof schemaOperationCreate>;

/**
 * Represents data response when creating {@link IOperation}.
 */
export interface IOperationCreatedResponse {
  new_operation: IOperationDTO;
  oss: IOperationSchemaDTO;
}

/**
 * Represents target {@link IOperation}.
 */
export interface ITargetOperation {
  positions: IOperationPosition[];
  target: OperationID;
}

/**
 * Represents {@link IOperation} data, used in destruction process.
 */
export const schemaOperationDelete = z.object({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  keep_constituents: z.boolean(),
  delete_schema: z.boolean()
});

/**
 * Represents {@link IOperation} data, used in destruction process.
 */
export type IOperationDeleteDTO = z.infer<typeof schemaOperationDelete>;

/**
 * Represents data response when creating {@link IRSForm} for Input {@link IOperation}.
 */
export interface IInputCreatedResponse {
  new_schema: ILibraryItem;
  oss: IOperationSchemaDTO;
}

/**
 * Represents {@link IOperation} data, used in setInput process.
 */
export const schemaInputUpdate = z.object({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  input: z.number().nullable()
});

/**
 * Represents {@link IOperation} data, used in setInput process.
 */
export type IInputUpdateDTO = z.infer<typeof schemaInputUpdate>;

/**
 * Represents {@link IOperation} data, used in update process.
 */
export const schemaOperationUpdate = z.object({
  target: z.number(),
  positions: z.array(schemaOperationPosition),
  item_data: z.object({
    alias: z.string().nonempty(),
    title: z.string(),
    comment: z.string()
  }),
  arguments: z.array(z.number()),
  substitutions: z.array(schemaCstSubstitute)
});

/**
 * Represents {@link IOperation} data, used in update process.
 */
export type IOperationUpdateDTO = z.infer<typeof schemaOperationUpdate>;

/**
 * Represents data, used relocating {@link IConstituenta}s between {@link ILibraryItem}s.
 */
export const schemaCstRelocate = z.object({
  destination: z.number(),
  items: z.array(z.number()).refine(data => data.length > 0)
});

/**
 * Represents data, used relocating {@link IConstituenta}s between {@link ILibraryItem}s.
 */
export type ICstRelocateDTO = z.infer<typeof schemaCstRelocate>;

export const ossApi = {
  baseKey: 'oss',

  getOssQueryOptions: ({ itemID }: { itemID?: number }) => {
    return queryOptions({
      queryKey: [ossApi.baseKey, 'item', itemID],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        !itemID
          ? undefined
          : axiosGet<IOperationSchemaDTO>({
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
      endpoint: `/api/oss/${itemID}/create-operation`,
      request: {
        data: data,
        successMessage: response => infoMsg.newOperation(response.new_operation.alias)
      }
    }),
  operationDelete: ({ itemID, data }: { itemID: number; data: IOperationDeleteDTO }) =>
    axiosPatch<IOperationDeleteDTO, IOperationSchemaDTO>({
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
      endpoint: `/api/oss/${itemID}/set-input`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  operationUpdate: ({ itemID, data }: { itemID: number; data: IOperationUpdateDTO }) =>
    axiosPatch<IOperationUpdateDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/update-operation`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  operationExecute: ({ itemID, data }: { itemID: number; data: ITargetOperation }) =>
    axiosPost<ITargetOperation, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/execute-operation`,
      request: {
        data: data,
        successMessage: infoMsg.operationExecuted
      }
    }),

  relocateConstituents: (data: ICstRelocateDTO) =>
    axiosPost<ICstRelocateDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/relocate-constituents`,
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    }),
  getPredecessor: (data: ITargetCst) =>
    axiosPost<ITargetCst, IConstituentaReference>({
      endpoint: '/api/oss/get-predecessor',
      request: { data: data }
    })
};
