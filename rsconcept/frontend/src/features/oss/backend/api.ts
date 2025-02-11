import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { ILibraryItem, ILibraryItemData, LibraryItemID } from '@/features/library/models/library';
import {
  IArgument,
  ICstSubstitute,
  ICstSubstituteEx,
  IOperation,
  OperationID,
  OperationType
} from '@/features/oss/models/oss';
import { IConstituentaReference, ITargetCst } from '@/features/rsform/models/rsform';
import { information } from '@/utils/labels';

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
export interface IOperationUpdateDTO extends ITargetOperation {
  item_data: {
    alias: string;
    title: string;
    comment: string;
  };
  arguments: OperationID[] | undefined;
  substitutions: ICstSubstitute[] | undefined;
}

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

  getOssQueryOptions: ({ itemID }: { itemID?: LibraryItemID }) => {
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
    itemID: LibraryItemID;
    positions: IOperationPosition[];
    isSilent?: boolean;
  }) =>
    axiosPatch({
      endpoint: `/api/oss/${itemID}/update-positions`,
      request: {
        data: { positions: positions },
        successMessage: isSilent ? undefined : information.changesSaved
      }
    }),

  operationCreate: ({ itemID, data }: { itemID: LibraryItemID; data: IOperationCreateDTO }) =>
    axiosPost<IOperationCreateDTO, IOperationCreatedResponse>({
      endpoint: `/api/oss/${itemID}/create-operation`,
      request: {
        data: data,
        successMessage: response => information.newOperation(response.new_operation.alias)
      }
    }),
  operationDelete: ({ itemID, data }: { itemID: LibraryItemID; data: IOperationDeleteDTO }) =>
    axiosPatch<IOperationDeleteDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/delete-operation`,
      request: {
        data: data,
        successMessage: information.operationDestroyed
      }
    }),
  inputCreate: ({ itemID, data }: { itemID: LibraryItemID; data: ITargetOperation }) =>
    axiosPatch<ITargetOperation, IInputCreatedResponse>({
      endpoint: `/api/oss/${itemID}/create-input`,
      request: {
        data: data,
        successMessage: information.newLibraryItem
      }
    }),
  inputUpdate: ({ itemID, data }: { itemID: LibraryItemID; data: IInputUpdateDTO }) =>
    axiosPatch<IInputUpdateDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/set-input`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  operationUpdate: ({ itemID, data }: { itemID: LibraryItemID; data: IOperationUpdateDTO }) =>
    axiosPatch<IOperationUpdateDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/update-operation`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  operationExecute: ({ itemID, data }: { itemID: LibraryItemID; data: ITargetOperation }) =>
    axiosPost<ITargetOperation, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/execute-operation`,
      request: {
        data: data,
        successMessage: information.operationExecuted
      }
    }),

  relocateConstituents: (data: ICstRelocateDTO) =>
    axiosPost<ICstRelocateDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/relocate-constituents`,
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    }),
  getPredecessor: (data: ITargetCst) =>
    axiosPost<ITargetCst, IConstituentaReference>({
      endpoint: '/api/oss/get-predecessor',
      request: { data: data }
    })
};
