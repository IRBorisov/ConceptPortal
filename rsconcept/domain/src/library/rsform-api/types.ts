/**
 * Capability field slices for schema transforms.
 *
 * Named by concern/task (*Fields), not as subtypes of Constituenta —
 * same idea as ConceptCore's RSConcept / TextConcept split.
 */

import { type ExpressionType, type TypePath } from '../../rslang';
import { type CstStatus, type CstType, type TermForm } from '../rsform';

/** Fields needed to restore formal dependency order. */
export interface FormalOrderFields {
  id: number;
  alias: string;
  cst_type: CstType;
  definition_formal: string;
}

/** Semantic parent/children derived from formal definitions (backend SemanticInfo). */
export interface SemanticRelations {
  /** Parent id for each constituenta (self when none). */
  parentOf: Map<number, number>;
  /** Semantic children ids for each constituenta. */
  childrenOf: Map<number, number[]>;
}

/** Fields needed to resolve term/definition entity references. */
export interface TextResolvableFields {
  id: number;
  alias: string;
  term_raw: string;
  term_resolved: string;
  term_forms: TermForm[];
  definition_raw: string;
  definition_resolved: string;
}

/** Fields needed to allocate or reset aliases by type. */
export interface AliasTypedFields {
  alias: string;
  cst_type: CstType;
}

/** Fields needed to decide whether structure can be produced. */
export interface StructureCapableFields {
  cst_type: CstType;
  effectiveType: ExpressionType | null;
}

/** Fields needed for schema-issue checks (status + diagnostics). */
export interface SchemaIssueFields {
  status: CstStatus;
  diagnostics?: readonly { code: number }[] | null;
}

/** Fields needed to look up evaluation status for a model item. */
export interface ModelEvalFields {
  id: number;
  cst_type: CstType;
}

/** Fields needed to check missing convention / resolved term on basics. */
export interface BasicTextCheckFields {
  cst_type: CstType;
  convention: string;
  term_resolved: string;
}

/** Fields needed to walk spawn paths for structure helpers. */
export interface SpawnPathFields {
  id: number;
  spawner?: number;
  spawner_path?: TypePath;
}

/** Fields needed to extract template parameters from a bank item. */
export interface TemplateParamSourceFields {
  definition_formal: string;
  effectiveType: ExpressionType | null;
}

/** Fields copied from a template bank item when instantiating. */
export interface TemplateSourceFields extends TemplateParamSourceFields {
  alias: string;
  cst_type: CstType;
  crucial: boolean;
  convention: string;
  definition_raw: string;
  term_raw: string;
  term_forms: TermForm[];
  typification_manual: string;
  value_is_property: boolean;
}

/** Fields needed to expand schema/model diagnostics into expressions. */
export interface DiagnosticSourceFields {
  id: number;
  alias: string;
  cst_type: CstType;
  term_resolved: string;
  convention: string;
  typification_manual: string;
  definition_formal: string;
}

/** Fields needed for text search over constituenta content. */
export interface SearchableFields {
  alias: string;
  cst_type: CstType;
  term_raw: string;
  term_resolved: string;
  definition_formal: string;
  definition_raw: string;
  definition_resolved: string;
  convention: string;
}

/** Fields needed to build short UI descriptions / labels. */
export interface DescribableFields extends SearchableFields {}
