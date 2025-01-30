import { queryOptions } from '@tanstack/react-query';

import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { ILibraryItem, ILibraryItemData, LibraryItemID } from '@/models/library';
import {
  IArgument,
  ICstSubstitute,
  ICstSubstituteEx,
  IOperation,
  IOperationPosition,
  OperationID,
  OperationType
} from '@/models/oss';
import { ConstituentaID, IConstituentaReference, ITargetCst } from '@/models/rsform';
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
 * Represents {@link IOperation} data, used in creation process.
 */
export interface IOperationCreateDTO {
  positions: IOperationPosition[];
  item_data: {
    alias: string;
    operation_type: OperationType;
    title: string;
    comment: string;
    position_x: number;
    position_y: number;
    result: LibraryItemID | null;
  };
  arguments: OperationID[] | undefined;
  create_schema: boolean;
}

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
export interface IOperationDeleteDTO extends ITargetOperation {
  keep_constituents: boolean;
  delete_schema: boolean;
}

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
export interface IInputUpdateDTO extends ITargetOperation {
  input: LibraryItemID | null;
}

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
export interface ICstRelocateDTO {
  destination: LibraryItemID;
  items: ConstituentaID[];
}

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
    axiosDelete<IOperationDeleteDTO, IOperationSchemaDTO>({
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

  relocateConstituents: ({ itemID, data }: { itemID: LibraryItemID; data: ICstRelocateDTO }) =>
    axiosPost<ICstRelocateDTO, IOperationSchemaDTO>({
      endpoint: `/api/oss/${itemID}/relocate-constituents`,
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
