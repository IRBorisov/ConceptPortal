/**
 * Module: Schema of Synthesis Operations.
 */

import { type Graph } from '@/models/graph';

import {
  type IBlockDTO,
  type ICstSubstituteInfo,
  type IOperationDTO,
  type IOperationSchemaDTO
} from '../backend/types';

/** Represents OSS node type. */
export const NodeType = {
  OPERATION: 1,
  BLOCK: 2
} as const;
export type NodeType = (typeof NodeType)[keyof typeof NodeType];

/** Represents Operation. */
export interface IOperation extends IOperationDTO {
  nodeID: string;
  nodeType: typeof NodeType.OPERATION;
  x: number;
  y: number;
  is_import: boolean;
  is_consolidation: boolean; // aka 'diamond synthesis'
  substitutions: ICstSubstituteInfo[];
  arguments: number[];
}

/** Represents Block. */
export interface IBlock extends IBlockDTO {
  nodeID: string;
  nodeType: typeof NodeType.BLOCK;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Represents item of OperationSchema. */
export type IOssItem = IOperation | IBlock;

/** Represents {@link IOperationSchema} statistics. */
export interface IOperationSchemaStats {
  count_all: number;
  count_inputs: number;
  count_synthesis: number;
  count_schemas: number;
  count_owned: number;
  count_block: number;
}

/** Represents OperationSchema. */
export interface IOperationSchema extends IOperationSchemaDTO {
  operations: IOperation[];
  blocks: IBlock[];

  graph: Graph;
  hierarchy: Graph<string>;
  schemas: number[];
  stats: IOperationSchemaStats;
  operationByID: Map<number, IOperation>;
  blockByID: Map<number, IBlock>;
  itemByNodeID: Map<string, IOssItem>;
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
