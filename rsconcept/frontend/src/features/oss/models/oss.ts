/**
 * Module: Schema of Synthesis Operations.
 */

import { type Graph } from '@/models/graph';

import {
  type BlockDTO,
  type CstSubstituteInfo,
  type OperationDTO,
  type OperationSchemaDTO,
  type OperationType
} from '../backend/types';

/** Represents OSS node type. */
export const NodeType = {
  OPERATION: 1,
  BLOCK: 2
} as const;
export type NodeType = (typeof NodeType)[keyof typeof NodeType];

/** Represents OSS graph node. */
export interface OssNode {
  nodeID: string;
  nodeType: NodeType;
  parent: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Represents Operation common attributes. */
export interface OperationBase
  extends OssNode,
  Pick<OperationDTO, 'alias' | 'title' | 'description' | 'id' | 'operation_type' | 'result'> {
  nodeType: typeof NodeType.OPERATION;
}

/** Represents Input Operation. */
export interface OperationInput extends OperationBase {
  operation_type: typeof OperationType.INPUT;
  is_import: boolean;
}

/** Represents Replica Operation. */
export interface OperationReplica extends OperationBase {
  operation_type: typeof OperationType.REPLICA;
  target: number;
}

/** Represents Synthesis Operation. */
export interface OperationSynthesis extends OperationBase {
  operation_type: typeof OperationType.SYNTHESIS;
  is_consolidation: boolean; // aka 'diamond synthesis'
  substitutions: CstSubstituteInfo[];
  arguments: number[];
}

/** Represents Operation. */
export type Operation = OperationInput | OperationReplica | OperationSynthesis;

/** Represents Block. */
export interface Block extends OssNode, BlockDTO {
  nodeType: typeof NodeType.BLOCK;
}

/** Represents item of OperationSchema. */
export type OssItem = Operation | Block;

/** Represents {@link OperationSchema} statistics. */
export interface OperationSchemaStats {
  count_all: number;
  count_inputs: number;
  count_synthesis: number;
  count_schemas: number;
  count_owned: number;
  count_block: number;
  count_references: number;
}

/** Represents OperationSchema. */
export interface OperationSchema extends Omit<OperationSchemaDTO, 'operations'> {
  operations: Operation[];
  blocks: Block[];

  graph: Graph;
  extendedGraph: Graph;
  hierarchy: Graph<string>;
  schemas: number[];
  stats: OperationSchemaStats;
  operationByID: Map<number, Operation>;
  blockByID: Map<number, Block>;
  itemByNodeID: Map<string, OssItem>;
}

/** Represents substitution error description. */
export interface SubstitutionErrorDescription {
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
  unequalArgs: 10,
  invalidNominal: 11
} as const;

export type SubstitutionErrorType = (typeof SubstitutionErrorType)[keyof typeof SubstitutionErrorType];
