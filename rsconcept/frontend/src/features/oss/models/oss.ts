/**
 * Module: Schema of Synthesis Operations.
 */
import { ILibraryItem, ILibraryItemData, LibraryItemID } from '@/features/library/models/library';
import { ICstSubstitute } from '@/features/rsform/backend/api';
import { IConstituenta } from '@/features/rsform/models/rsform';

import { Graph } from '../../../models/Graph';

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

  is_owned: boolean;
  is_consolidation: boolean; // aka 'diamond synthesis'
  substitutions: ICstSubstituteEx[];
  arguments: OperationID[];
}

/**
 * Represents {@link IOperation} Argument.
 */
export interface IArgument {
  operation: OperationID;
  argument: OperationID;
}

/**
 * Represents substitution for multi synthesis table.
 */
export interface IMultiSubstitution {
  original_source: ILibraryItem;
  original: IConstituenta;
  substitution: IConstituenta;
  substitution_source: ILibraryItem;
  is_suggestion: boolean;
}

/**
 * Represents {@link ICstSubstitute} extended data.
 */
export interface ICstSubstituteEx extends ICstSubstitute {
  operation: OperationID;
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
  count_owned: number;
}

/**
 * Represents OperationSchema.
 */
export interface IOperationSchema extends ILibraryItemData {
  items: IOperation[];
  arguments: IArgument[];
  substitutions: ICstSubstituteEx[];

  graph: Graph;
  schemas: LibraryItemID[];
  stats: IOperationSchemaStats;
  operationByID: Map<OperationID, IOperation>;
}

/**
 * Represents substitution error description.
 */
export interface ISubstitutionErrorDescription {
  errorType: SubstitutionErrorType;
  params: string[];
}

/**
 * Represents Substitution table error types.
 */
export enum SubstitutionErrorType {
  invalidIDs,
  incorrectCst,
  invalidClasses,
  invalidBasic,
  invalidConstant,
  typificationCycle,
  baseSubstitutionNotSet,
  unequalTypification,
  unequalExpressions,
  unequalArgsCount,
  unequalArgs
}
