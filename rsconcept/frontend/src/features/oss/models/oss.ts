/**
 * Module: Schema of Synthesis Operations.
 */

import { type Graph } from '@/models/graph';

import { type ICstSubstituteInfo, type IOperationDTO, type IOperationSchemaDTO } from '../backend/types';

/** Represents Operation. */
export interface IOperation extends IOperationDTO {
  is_owned: boolean;
  is_consolidation: boolean; // aka 'diamond synthesis'
  substitutions: ICstSubstituteInfo[];
  arguments: number[];
}

/** Represents {@link IOperationSchema} statistics. */
export interface IOperationSchemaStats {
  count_operations: number;
  count_inputs: number;
  count_synthesis: number;
  count_schemas: number;
  count_owned: number;
}

/** Represents OperationSchema. */
export interface IOperationSchema extends IOperationSchemaDTO {
  items: IOperation[];

  graph: Graph;
  schemas: number[];
  stats: IOperationSchemaStats;
  operationByID: Map<number, IOperation>;
}

/** Represents substitution error description. */
export interface ISubstitutionErrorDescription {
  errorType: SubstitutionErrorType;
  params: string[];
}

/** Represents Substitution table error types. */
export const SubstitutionErrorType = {
  invalidIDs: 0,
  incorrectCst: 1,
  invalidClasses: 2,
  invalidBasic: 3,
  invalidConstant: 4,
  typificationCycle: 5,
  baseSubstitutionNotSet: 6,
  unequalTypification: 7,
  unequalExpressions: 8,
  unequalArgsCount: 9,
  unequalArgs: 10
} as const;

export type SubstitutionErrorType = (typeof SubstitutionErrorType)[keyof typeof SubstitutionErrorType];
