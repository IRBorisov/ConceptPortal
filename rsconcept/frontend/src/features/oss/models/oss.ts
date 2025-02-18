/**
 * Module: Schema of Synthesis Operations.
 */

import { ILibraryItemData } from '@/features/library/backend/types';

import { Graph } from '@/models/Graph';

import { IArgument, ICstSubstituteEx, IOperation } from '../backend/types';

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
  schemas: number[];
  stats: IOperationSchemaStats;
  operationByID: Map<number, IOperation>;
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
