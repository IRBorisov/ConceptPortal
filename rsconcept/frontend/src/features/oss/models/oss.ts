/**
 * Module: Schema of Synthesis Operations.
 */

import { type Graph } from '@/models/graph';

import {
  type IBlockDTO,
  type ICstSubstituteInfo,
  type IOperationDTO,
  type IOperationSchemaDTO,
  type OperationType
} from '../backend/types';

/** Represents OSS node type. */
export const NodeType = {
  OPERATION: 1,
  BLOCK: 2
} as const;
export type NodeType = (typeof NodeType)[keyof typeof NodeType];

/** Represents OSS graph node. */
export interface IOssNode {
  nodeID: string;
  nodeType: NodeType;
  parent: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Represents Operation common attributes. */
export interface IOperationBase
  extends IOssNode,
    Pick<IOperationDTO, 'alias' | 'title' | 'description' | 'id' | 'operation_type' | 'result'> {
  nodeType: typeof NodeType.OPERATION;
}

/** Represents Input Operation. */
export interface IOperationInput extends IOperationBase {
  operation_type: typeof OperationType.INPUT;
  is_import: boolean;
}

/** Represents Replica Operation. */
export interface IOperationReplica extends IOperationBase {
  operation_type: typeof OperationType.REPLICA;
  target: number;
}

/** Represents Synthesis Operation. */
export interface IOperationSynthesis extends IOperationBase {
  operation_type: typeof OperationType.SYNTHESIS;
  is_consolidation: boolean; // aka 'diamond synthesis'
  substitutions: ICstSubstituteInfo[];
  arguments: number[];
}

/** Represents Operation. */
export type IOperation = IOperationInput | IOperationReplica | IOperationSynthesis;

/** Represents Block. */
export interface IBlock extends IOssNode, IBlockDTO {
  nodeType: typeof NodeType.BLOCK;
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
  count_references: number;
}

/** Represents OperationSchema. */
export interface IOperationSchema extends Omit<IOperationSchemaDTO, 'operations'> {
  operations: IOperation[];
  blocks: IBlock[];

  graph: Graph;
  extendedGraph: Graph;
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
