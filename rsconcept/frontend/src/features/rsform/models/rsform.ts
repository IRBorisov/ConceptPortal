/**
 * Module: Models for formal representation for systems of concepts.
 */

import {
  type CurrentVersion,
  type ILibraryItemData,
  type ILibraryItemReference,
  type IVersionInfo
} from '@/features/library';

import { type Graph } from '@/models/graph';

import { CstType, type IAssociation, type ParsingStatus, type ValueClass } from '../backend/types';

import { type IArgumentInfo } from './rslang';

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
export const ExpressionStatus = {
  VERIFIED: 'verified',
  INCORRECT: 'incorrect',
  INCALCULABLE: 'incalculable',
  PROPERTY: 'property',
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown'
} as const;
export type ExpressionStatus = (typeof ExpressionStatus)[keyof typeof ExpressionStatus];

/** Represents word form for natural language. */
export interface TermForm {
  text: string;
  tags: string;
}

/** Represents Constituenta. */
export interface IConstituenta {
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
  associations: number[];

  parse?: {
    status: ParsingStatus;
    valueClass: ValueClass;
    typification: string;
    syntaxTree: string;
    args: IArgumentInfo[];
  };

  /** Identifier of {@link LibraryItem} containing this {@link IConstituenta}. */
  schema: number;

  /** {@link CstClass} of this {@link IConstituenta}. */
  cst_class: CstClass;
  /** {@link ExpressionStatus} of this {@link IConstituenta}. */
  status: ExpressionStatus;

  /** Indicates if this {@link IConstituenta} is a template. */
  is_template: boolean;
  /** Indicates if this {@link IConstituenta} has a simple expression. */
  is_simple_expression: boolean;

  /** Index of {@link LibraryItem} that contains this cst (or inheritance parent).
   *  0 - not inherited, 1 - inherited by 1st schema, 2 - inherited by 2nd schema, etc.
   */
  parent_schema_index: number;
  /** {@link LibraryItem} that contains parent of this inherited {@link IConstituenta}. */
  parent_schema?: number;
  /** Indicates if this {@link IConstituenta} is inherited. */
  is_inherited: boolean;
  /** Indicates if this {@link IConstituenta} has children that are inherited. */
  has_inherited_children: boolean;

  /** {@link IConstituenta} that spawned this one. */
  spawner?: number;
  /** Alias of {@link IConstituenta} that spawned this one. */
  spawner_alias?: string;
  /** List of {@link IConstituenta} that are spawned by this one. */
  spawn: number[];
  /** List of aliases of {@link IConstituenta} that are spawned by this one. */
  spawn_alias: string[];
}

/** Represents {@link IRSForm} statistics. */
export interface IRSFormStats {
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

/** Represents inheritance data for {@link IRSForm}. */
export interface IInheritanceInfo {
  child: number;
  child_source: number;
  parent: number;
  parent_source: number;
}

/** Represents formal explication for set of concepts. */
export interface IRSForm extends ILibraryItemData {
  version: CurrentVersion;
  versions: IVersionInfo[];

  items: IConstituenta[];
  inheritance: IInheritanceInfo[];
  association: IAssociation[];
  oss: ILibraryItemReference[];

  stats: IRSFormStats;
  graph: Graph;
  association_graph: Graph;
  full_graph: Graph;
  cstByAlias: Map<string, IConstituenta>;
  cstByID: Map<number, IConstituenta>;
}
