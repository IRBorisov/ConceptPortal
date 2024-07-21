/**
 * Module: Schema of Synthesis Operations.
 */

import { Graph } from './Graph';
import { ILibraryItemData, LibraryItemID } from './library';
import { ConstituentaID } from './rsform';

/**
 * Represents {@link IOperation} identifier type.
 */
export type OperationID = number;

/**
 * Represents {@link IOperation} type.
 */
export enum OperationType {
  INPUT = 'input',
  SYNTHESIS = 'synthesis'
}

/**
 * Represents Operation.
 */
export interface IOperation {
  id: OperationID;
  operation_type: OperationType;
  oss: LibraryItemID;

  alias: string;
  title: string;
  comment: string;
  position_x: number;
  position_y: number;

  result: LibraryItemID | null;
}

/**
 * Represents {@link IOperation} position.
 */
export interface IOperationPosition extends Pick<IOperation, 'id' | 'position_x' | 'position_y'> {}

/**
 * Represents {@link IOperation} data, used in creation process.
 */
export interface IOperationCreateData {
  item_data: Pick<
    IOperation,
    'alias' | 'operation_type' | 'title' | 'comment' | 'position_x' | 'position_y' | 'result'
  >;
  arguments: OperationID[] | undefined;
  positions: IOperationPosition[];
}

/**
 * Represents {@link IOperation} Argument.
 */
export interface IArgument {
  operation: OperationID;
  argument: OperationID;
}

/**
 * Represents data, used in merging single {@link IConstituenta}.
 */
export interface ICstSubstitute {
  original: ConstituentaID;
  substitution: ConstituentaID;
  transfer_term: boolean;
}

/**
 * Represents data, used in merging multiple {@link IConstituenta}.
 */
export interface ICstSubstituteData {
  substitutions: ICstSubstitute[];
}

/**
 * Represents {@link ICstSubstitute} extended data.
 */
export interface ICstSubstituteEx extends ICstSubstitute {
  original_alias: string;
  original_term: string;
  substitution_alias: string;
  substitution_term: string;
}

/**
 * Represents backend data for {@link IOperationSchema}.
 */
export interface IOperationSchemaData extends ILibraryItemData {
  items: IOperation[];
  arguments: IArgument[];
  substitutions: ICstSubstituteEx[];
}

/**
 * Represents OperationSchema.
 */
export interface IOperationSchema extends IOperationSchemaData {
  graph: Graph;
  operationByID: Map<OperationID, IOperation>;
}

/**
 * Represents data response when creating {@link IOperation}.
 */
export interface IOperationCreatedResponse {
  new_operation: IOperation;
  oss: IOperationSchemaData;
}
