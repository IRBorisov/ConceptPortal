/**
 * Module: Models for formal representation for systems of concepts.
 */

import { ILibraryItemReference, ILibraryItemVersioned } from '@/features/library/models/library';
import { Graph } from '@/models/Graph';

import { IArgumentInfo, ParsingStatus, ValueClass } from './rslang';

/**
 * Represents {@link IConstituenta} type.
 */
export enum CstType {
  BASE = 'basic',
  STRUCTURED = 'structure',
  TERM = 'term',
  AXIOM = 'axiom',
  FUNCTION = 'function',
  PREDICATE = 'predicate',
  CONSTANT = 'constant',
  THEOREM = 'theorem'
}

// CstType constant for category dividers in TemplateSchemas
export const CATEGORY_CST_TYPE = CstType.THEOREM;

/**
 * Represents {@link IConstituenta} identifier type.
 */
export type ConstituentaID = number;

/**
 * Represents Constituenta classification in terms of system of concepts.
 */
export enum CstClass {
  BASIC = 'basic',
  DERIVED = 'derived',
  STATEMENT = 'statement',
  TEMPLATE = 'template'
}

/**
 * Represents formal expression Status.
 */
export enum ExpressionStatus {
  VERIFIED = 'verified',
  INCORRECT = 'incorrect',
  INCALCULABLE = 'incalculable',
  PROPERTY = 'property',
  UNDEFINED = 'undefined',
  UNKNOWN = 'unknown'
}

/**
 * Represents word form for natural language.
 */
export interface TermForm {
  text: string;
  tags: string;
}

/**
 * Represents Constituenta basic persistent data.
 */
export interface IConstituentaMeta {
  id: ConstituentaID;
  alias: string;
  convention: string;
  cst_type: CstType;
  definition_formal: string;
  definition_raw: string;
  definition_resolved: string;
  term_raw: string;
  term_resolved: string;
  term_forms: TermForm[];
}

/**
 * Represents target {@link IConstituenta}.
 */
export interface ITargetCst {
  target: ConstituentaID;
}

/**
 * Represents Constituenta.
 */
export interface IConstituenta extends IConstituentaMeta {
  parse: {
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

  /** Index of {@link LibraryItemID} that contains this cst (or inheritance parent).
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
  spawner?: ConstituentaID;
  /** Alias of {@link IConstituenta} that spawned this one. */
  spawner_alias?: string;
  /** List of {@link IConstituenta} that are spawned by this one. */
  spawn: number[];
  /** List of aliases of {@link IConstituenta} that are spawned by this one. */
  spawn_alias: string[];
}

/**
 * Represents {@link IConstituenta} reference.
 */
export interface IConstituentaReference extends Pick<IConstituenta, 'id' | 'schema'> {}

/**
 * Represents Constituenta list.
 */
export interface IConstituentaList {
  items: ConstituentaID[];
}

/**
 * Represents {@link IRSForm} statistics.
 */
export interface IRSFormStats {
  count_all: number;
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
}

/**
 * Represents inheritance data for {@link IRSForm}.
 */
export interface IInheritanceInfo {
  child: ConstituentaID;
  child_source: number;
  parent: ConstituentaID;
  parent_source: number;
}

/**
 * Represents formal explication for set of concepts.
 */
export interface IRSForm extends ILibraryItemVersioned {
  items: IConstituenta[];
  inheritance: IInheritanceInfo[];
  oss: ILibraryItemReference[];

  stats: IRSFormStats;
  graph: Graph;
  cstByAlias: Map<string, IConstituenta>;
  cstByID: Map<ConstituentaID, IConstituenta>;
}

/**
 * Represents single substitution for binary synthesis table.
 */
export interface IBinarySubstitution {
  leftCst: IConstituenta;
  rightCst: IConstituenta;
  deleteRight: boolean;
}
