/**
 * Module: Schema of Synthesis Operations.
 */

import { type Graph } from '../graph';

import { RSDiagnosticCode } from './diagnostics';
import { type LibraryItem } from './library';
import { type NodePosition, type OssLayout } from './oss-layout';

/** Represents OSS node type. */
export const NodeType = {
  OPERATION: 1,
  BLOCK: 2
} as const;
export type NodeType = (typeof NodeType)[keyof typeof NodeType];

/** Represents OSS graph node. */
interface OssNode extends NodePosition {
  nodeType: NodeType;
  parent: number | null;
}

/** Represents {@link Operation} type. */
export const OperationType = {
  INPUT: 'input',
  SYNTHESIS: 'synthesis',
  REPLICA: 'replica'
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

/** Represents {@link Substitution} extended data. */
export interface CstSubstituteInfo {
  original: number;
  substitution: number;
  operation: number;
  original_schema: number;
  original_alias: string;
  original_term: string;
  substitution_schema: number;
  substitution_alias: string;
  substitution_term: string;
}

/** Represents Operation common attributes. */
interface OperationBase extends OssNode {
  id: number;
  alias: string;
  title: string;
  description: string;
  operation_type: OperationType;
  result: number | null;
  nodeType: typeof NodeType.OPERATION;
  has_additions: boolean;
}

/** Represents Input Operation. */
export interface OperationInput extends OperationBase {
  operation_type: typeof OperationType.INPUT;
  is_import: boolean;
}

/** Represents Replica Operation. */
interface OperationReplica extends OperationBase {
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
export interface Block extends OssNode {
  id: number;
  oss: number;
  title: string;
  description: string;
  parent: number | null;
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
export interface OperationSchema extends LibraryItem {
  editors: number[];
  operations: Operation[];
  blocks: Block[];
  replicas: {
    original: number;
    replica: number;
  }[];
  layout: OssLayout;
  arguments: {
    operation: number;
    argument: number;
  }[];
  substitutions: CstSubstituteInfo[];

  graph: Graph;
  extendedGraph: Graph;
  hierarchy: Graph<string>;
  schemas: number[];
  stats: OperationSchemaStats;
  operationByID: Map<number, Operation>;
  blockByID: Map<number, Block>;
  itemByNodeID: Map<string, OssItem>;
}

/** Represents substitution error description (same code space as {@link RSDiagnosticCode}). */
export interface SubstitutionErrorDescription {
  code: SubstitutionErrorType;
  params: string[];
}

/**
 * Substitution-table error codes — aliases into {@link RSDiagnosticCode}.
 * Logical definition cycles reuse {@link RSDiagnosticCode.schemaDependencyCycle}.
 */
export const SubstitutionErrorType = {
  invalidIDs: RSDiagnosticCode.substitutionInvalidIDs,
  incorrectCst: RSDiagnosticCode.substitutionIncorrectCst,
  invalidClasses: RSDiagnosticCode.substitutionInvalidClasses,
  invalidBasic: RSDiagnosticCode.substitutionInvalidBasic,
  invalidConstant: RSDiagnosticCode.substitutionInvalidConstant,
  typificationCycle: RSDiagnosticCode.substitutionTypificationCycle,
  baseSubstitutionNotSet: RSDiagnosticCode.substitutionBaseNotSet,
  unequalTypification: RSDiagnosticCode.substitutionUnequalTypification,
  unequalExpressions: RSDiagnosticCode.substitutionUnequalExpressions,
  unequalArgsCount: RSDiagnosticCode.substitutionUnequalArgsCount,
  unequalArgs: RSDiagnosticCode.substitutionUnequalArgs,
  invalidNominal: RSDiagnosticCode.substitutionInvalidNominal,
  /** Same code as constituent schema dependency cycle. */
  definitionCycle: RSDiagnosticCode.schemaDependencyCycle
} as const satisfies Record<string, (typeof RSDiagnosticCode)[keyof typeof RSDiagnosticCode]>;
export type SubstitutionErrorType = (typeof SubstitutionErrorType)[keyof typeof SubstitutionErrorType];
