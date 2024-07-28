/**
 * Module: Schema of Synthesis Operations.
 */

import { Graph } from './Graph';
import { ILibraryItem, ILibraryItemData, LibraryItemID } from './library';
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
  sync_text: boolean;

  position_x: number;
  position_y: number;

  result: LibraryItemID | null;
}

/**
 * Represents {@link IOperation} position.
 */
export interface IOperationPosition extends Pick<IOperation, 'id' | 'position_x' | 'position_y'> {}

/**
 * Represents all {@link IOperation} positions in {@link IOperationSchema}.
 */
export interface IPositionsData {
  positions: IOperationPosition[];
}

/**
 * Represents target {@link IOperation}.
 */
export interface ITargetOperation extends IPositionsData {
  target: OperationID;
}

/**
 * Represents {@link IOperation} data, used in creation process.
 */
export interface IOperationCreateData extends IPositionsData {
  item_data: Pick<
    IOperation,
    'alias' | 'operation_type' | 'title' | 'comment' | 'position_x' | 'position_y' | 'result' | 'sync_text'
  >;
  arguments: OperationID[] | undefined;
  create_schema: boolean;
}

/**
 * Represents {@link IOperation} data, used in setInput process.
 */
export interface IOperationSetInputData extends ITargetOperation {
  sync_text: boolean;
  input: LibraryItemID | null;
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
 * Represents {@link IOperationSchema} statistics.
 */
export interface IOperationSchemaStats {
  count_operations: number;
  count_inputs: number;
  count_synthesis: number;
  count_schemas: number;
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
  schemas: LibraryItemID[];
  stats: IOperationSchemaStats;
  operationByID: Map<OperationID, IOperation>;
}

/**
 * Represents data response when creating {@link IOperation}.
 */
export interface IOperationCreatedResponse {
  new_operation: IOperation;
  oss: IOperationSchemaData;
}

/**
 * Represents data response when creating {@link IRSForm} for Input {@link IOperation}.
 */
export interface IInputCreatedResponse {
  new_schema: ILibraryItem;
  oss: IOperationSchemaData;
}
