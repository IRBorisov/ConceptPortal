/**
 * Module: Models for formal representation for systems of concepts.
 */

import {
  type CurrentVersion,
  type LibraryItemData,
  type LibraryItemReference,
  type VersionInfo
} from '@/features/library';
import { type AnalysisBase, type ExpressionType, type RSLangAnalyzer } from '@/features/rslang';

import { type Graph } from '@/models/graph';
import { type RO } from '@/utils/meta';

import { type Attribution } from '../backend/types';

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


/** Represents function argument definition. */
export interface ArgumentInfo {
  alias: string;
  typification: string;
}

/** Represents global identifier type info. */
export interface TypeInfo {
  alias: string;
  type: ExpressionType;
}

/** Represents function argument value. */
export interface ArgumentValue extends ArgumentInfo {
  value?: string;
}

// CstType constant for category dividers in TemplateSchemas
export const CATEGORY_CST_TYPE = CstType.THEOREM;

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
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown'
} as const;
export type CstStatus = (typeof CstStatus)[keyof typeof CstStatus];

/** Represents word form for natural language. */
export interface TermForm {
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
  definition_raw: string;
  definition_resolved: string;
  term_raw: string;
  term_resolved: string;
  term_forms: TermForm[];
  attributes: number[];

  analysis: RO<AnalysisBase>;

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
  /** List of {@link Constituenta} that are spawned by this one. */
  spawn: number[];
  /** List of aliases of {@link Constituenta} that are spawned by this one. */
  spawn_alias: string[];
}

/** Represents {@link RSForm} statistics. */
export interface RSFormStats {
  count_all: number;
  count_crucial: number;

  count_errors: number;
  count_property: number;
  count_incalculable: number;
  count_inherited: number;

  count_text_term: number;
  count_definition: number;
  count_convention: number;

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
export interface InheritanceInfo {
  child: number;
  child_source: number;
  parent: number;
  parent_source: number;
}

/** Represents formal explication for set of concepts. */
export interface RSForm extends LibraryItemData {
  version: CurrentVersion;
  versions: VersionInfo[];

  items: Constituenta[];
  inheritance: InheritanceInfo[];
  attribution: Attribution[];
  oss: LibraryItemReference[];
  models: LibraryItemReference[];

  analyzer: RSLangAnalyzer;
  graph: Graph;
  attribution_graph: Graph;
  cstByAlias: Map<string, Constituenta>;
  cstByID: Map<number, Constituenta>;
}
