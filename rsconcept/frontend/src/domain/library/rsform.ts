/**
 * Module: Models for formal representation for systems of concepts.
 */

import { type Graph } from '@/domain/graph';
import { type CurrentVersion, type LibraryItem, type LibraryItemReference, type VersionInfo } from '@/domain/library';
import { type AnalysisBase, type ExpressionType, type RSLangAnalyzer, type TypePath } from '@/domain/rslang';

import { type RO } from '@/utils/meta';

/** Represents {@link Constituenta} type. */
export const CstType = {
  NOMINAL: 'nominal',
  BASE: 'basic',
  STRUCTURED: 'structure',
  TERM: 'term',
  AXIOM: 'axiom',
  FUNCTION: 'function',
  PREDICATE: 'predicate',
  CONSTANT: 'constant',
  THEOREM: 'theorem'
} as const;
export type CstType = (typeof CstType)[keyof typeof CstType];

/** Represents attribution of a {@link Constituenta} to another {@link Constituenta}. */
export interface Attribution {
  container: number;
  attribute: number;
}

/** Represents global identifier type info. */
export interface TypeInfo {
  alias: string;
  type: ExpressionType;
}

/** Represents function argument value. */
export interface ArgumentValue {
  alias: string;
  typification: string;
  value?: string;
}

/** Represents Constituenta classification in terms of system of concepts. */
export const CstClass = {
  NOMINAL: 'nominal',
  BASIC: 'basic',
  DERIVED: 'derived',
  STATEMENT: 'statement',
  TEMPLATE: 'template'
} as const;
export type CstClass = (typeof CstClass)[keyof typeof CstClass];

/** Represents formal expression Status. */
export const CstStatus = {
  VERIFIED: 'verified',
  INCORRECT: 'incorrect',
  INCALCULABLE: 'incalculable',
  PROPERTY: 'property',
  UNKNOWN: 'unknown'
} as const;
export type CstStatus = (typeof CstStatus)[keyof typeof CstStatus];

/** Represents substitution of {@link Constituenta}. */
export interface Substitution {
  original: number;
  substitution: number;
}

/** Represents word form for natural language. */
interface TermForm {
  text: string;
  tags: string;
}

/** Represents Constituenta. */
export interface Constituenta {
  id: number;
  crucial: boolean;
  alias: string;
  convention: string;
  cst_type: CstType;
  definition_formal: string;
  typification_manual: string;
  definition_raw: string;
  definition_resolved: string;
  term_raw: string;
  term_resolved: string;
  term_forms: TermForm[];
  attributes: number[];

  homonyms: number[];
  formalDuplicates: number[];
  analysis: RO<AnalysisBase>;
  /** Typification used for dependents, model values, and display (manual when it overrides computed). */
  effectiveType: ExpressionType | null;

  /**
   * True when manual typification is non-empty, parses to a type, and its label differs from the
   * typification inferred from the formal definition ({@link Constituenta.analysis}.type).
   */
  is_type_mismatch: boolean;

  /** Identifier of {@link LibraryItem} containing this {@link Constituenta}. */
  schema: number;

  /** {@link CstClass} of this {@link Constituenta}. */
  cst_class: CstClass;
  /** {@link CstStatus} of this {@link Constituenta}. */
  status: CstStatus;

  /** Indicates if this {@link Constituenta} is a template. */
  is_template: boolean;
  /** Indicates if this {@link Constituenta} has a simple expression. */
  is_simple_expression: boolean;

  /** Index of {@link LibraryItem} that contains this cst (or inheritance parent).
   *  0 - not inherited, 1 - inherited by 1st schema, 2 - inherited by 2nd schema, etc.
   */
  parent_schema_index: number;
  /** {@link LibraryItem} that contains parent of this inherited {@link Constituenta}. */
  parent_schema: number | null;
  /** Indicates if this {@link Constituenta} is inherited. */
  is_inherited: boolean;
  /** Indicates if this {@link Constituenta} has children that are inherited. */
  has_inherited_children: boolean;

  /** {@link Constituenta} that spawned this one. */
  spawner?: number;
  /** Alias of {@link Constituenta} that spawned this one. */
  spawner_alias?: string;
  /** Structure path that spawned this one. */
  spawner_path?: TypePath;

  /** List of {@link Constituenta} that are spawned by this one. */
  spawn: number[];
  /** List of aliases of {@link Constituenta} that are spawned by this one. */
  spawn_alias: string[];
}

/** Represents {@link RSForm} statistics. */
export interface RSFormStats {
  step_complexity: number;

  /** Total number of constituents in the RSForm. */
  count_all: number;
  /** Number of crucial constituents in the RSForm. */
  count_crucial: number;

  count_problematic: number;
  /** Constituents that have same term. */
  count_homonyms: number;
  /** Constituents that have same formal definition and term. */
  count_formal_duplicates: number;
  /** Base constituents with no convention and alias. */
  count_missing_convention: number;
  /** Constituents with non-empty manual typification that disagrees with inferred typification. */
  count_type_mismatch: number;

  count_incorrect: number;
  count_property: number;
  count_incalculable: number;
  count_inherited: number;

  count_text_term: number;
  count_definition: number;
  count_convention: number;
  count_comment: number;

  count_base: number;
  count_constant: number;
  count_structured: number;
  count_axiom: number;
  count_term: number;
  count_function: number;
  count_predicate: number;
  count_theorem: number;
  count_nominal: number;
}

/** Represents inheritance data for {@link RSForm}. */
interface InheritanceInfo {
  child: number;
  child_source: number;
  parent: number;
  parent_source: number;
}

/** Represents formal explication for set of concepts. */
export interface RSForm extends LibraryItem {
  /** Whether this RSForm was produced (vs imported or inherited) */
  is_produced: boolean;
  /** Whether this RSForm has attribution feature */
  is_attributive: boolean;
  /** List of user IDs who can edit this RSForm */
  editors: number[];
  /** Information about the current version of this RSForm */
  version: CurrentVersion;
  /** Full version history of this RSForm */
  versions: VersionInfo[];

  /** Full list of constituents in the RSForm */
  items: Constituenta[];
  /** List of inheritance relationships between constituents */
  inheritance: InheritanceInfo[];
  /** List of constituent attribution relationships */
  attribution: Attribution[];
  /** References to Operational Schemes/Systems associated with the RSForm */
  oss: LibraryItemReference[];
  /** References to conceptual models associated with the RSForm */
  models: LibraryItemReference[];

  /** Analyzer instance for RS language features and validation */
  analyzer: RSLangAnalyzer;
  /** Graph structure representing formal dependencies between constituents */
  graph: Graph;
  /** Graph structure representing attribution relationships */
  attribution_graph: Graph;
  /** Map for quick lookup of constituents by alias */
  cstByAlias: Map<string, Constituenta>;
  /** Map for quick lookup of constituents by ID */
  cstByID: Map<number, Constituenta>;
}
