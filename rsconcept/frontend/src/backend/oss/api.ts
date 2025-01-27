import { queryOptions } from '@tanstack/react-query';

import { axiosInstance } from '@/backend/axiosInstance';
import { DELAYS } from '@/backend/configuration';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import {
  ICstSubstitute,
  IOperationData,
  IOperationPosition,
  IOperationSchemaData,
  OperationID,
  OperationType
} from '@/models/oss';
import { ConstituentaID, IConstituentaReference, ITargetCst } from '@/models/rsform';

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
  new_operation: IOperationData;
  oss: IOperationSchemaData;
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
  oss: IOperationSchemaData;
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
          : axiosInstance
              .get<IOperationSchemaData>(`/api/oss/${itemID}/details`, {
                signal: meta.signal
              })
              .then(response => response.data)
    });
  },

  updatePositions: (data: { itemID: LibraryItemID; positions: IOperationPosition[] }) =>
    axiosInstance //
      .patch(`/api/oss/${data.itemID}/update-positions`, { positions: data.positions }),
  operationCreate: (data: { itemID: LibraryItemID; data: IOperationCreateDTO }) =>
    axiosInstance //
      .post<IOperationCreatedResponse>(`/api/oss/${data.itemID}/create-operation`, data.data)
      .then(response => response.data),
  operationDelete: (data: { itemID: LibraryItemID; data: IOperationDeleteDTO }) =>
    axiosInstance //
      .patch<IOperationSchemaData>(`/api/oss/${data.itemID}/delete-operation`, data.data)
      .then(response => response.data),
  inputCreate: (data: { itemID: LibraryItemID; data: ITargetOperation }) =>
    axiosInstance //
      .patch<IInputCreatedResponse>(`/api/oss/${data.itemID}/create-input`, data.data)
      .then(response => response.data),
  inputUpdate: (data: { itemID: LibraryItemID; data: IInputUpdateDTO }) =>
    axiosInstance //
      .patch<IOperationSchemaData>(`/api/oss/${data.itemID}/set-input`, data.data)
      .then(response => response.data),
  operationUpdate: (data: { itemID: LibraryItemID; data: IOperationUpdateDTO }) =>
    axiosInstance //
      .patch<IOperationSchemaData>(`/api/oss/${data.itemID}/update-operation`, data.data)
      .then(response => response.data),
  operationExecute: (data: { itemID: LibraryItemID; data: ITargetOperation }) =>
    axiosInstance //
      .post<IOperationSchemaData>(`/api/oss/${data.itemID}/execute-operation`, data.data)
      .then(response => response.data),

  relocateConstituents: (data: { itemID: LibraryItemID; data: ICstRelocateDTO }) =>
    axiosInstance //
      .post<IOperationSchemaData>(`/api/oss/${data.itemID}/relocate-constituents`, data.data)
      .then(response => response.data),
  getPredecessor: (data: ITargetCst) =>
    axiosInstance //
      .post<IConstituentaReference>(`/api/oss/get-predecessor`, data)
      .then(response => response.data)
};
