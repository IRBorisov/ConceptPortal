/**
 * Module: Models for formal representation for systems of concepts.
 */

import { Graph } from '@/models/Graph';

import { ILibraryItem, ILibraryItemReference, ILibraryItemVersioned, LibraryItemID } from './library';
import { ICstSubstitute } from './oss';
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
 * Represents position in linear order.
 */
export type Position = number;

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
  schema: LibraryItemID;
  order: Position;
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
 * Represents {@link IConstituenta} data from server.
 */
export interface IConstituentaData extends IConstituentaMeta {
  parse: {
    status: ParsingStatus;
    valueClass: ValueClass;
    typification: string;
    syntaxTree: string;
    args: IArgumentInfo[];
  };
}

/**
 * Represents Constituenta.
 */
export interface IConstituenta extends IConstituentaData {
  cst_class: CstClass;
  status: ExpressionStatus;
  is_template: boolean;
  is_simple_expression: boolean;
  is_inherited: boolean;
  is_inherited_parent: boolean;
  parent?: ConstituentaID;
  parent_alias?: string;
  children: number[];
  children_alias: string[];
}

/**
 * Represents {@link IConstituenta} reference.
 */
export interface IConstituentaReference extends Pick<IConstituentaMeta, 'id' | 'schema'> {}

/**
 * Represents Constituenta list.
 */
export interface IConstituentaList {
  items: ConstituentaID[];
}

/**
 * Represents {@link IConstituenta} data, used in creation process.
 */
export interface ICstCreateData
  extends Pick<
    IConstituentaMeta,
    'alias' | 'cst_type' | 'definition_raw' | 'term_raw' | 'convention' | 'definition_formal' | 'term_forms'
  > {
  insert_after: ConstituentaID | null;
}

/**
 * Represents data, used in ordering a list of {@link IConstituenta}.
 */
export interface ICstMovetoData extends IConstituentaList {
  move_to: Position;
}

/**
 * Represents data, used in updating persistent attributes in {@link IConstituenta}.
 */
export interface ICstUpdateData {
  target: ConstituentaID;
  item_data: Partial<
    Pick<IConstituentaMeta, 'convention' | 'definition_formal' | 'definition_raw' | 'term_raw' | 'term_forms'>
  >;
}

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export interface ICstRenameData extends ITargetCst, Pick<IConstituentaMeta, 'alias' | 'cst_type'> {}

/**
 * Represents data response when creating {@link IConstituenta}.
 */
export interface ICstCreatedResponse {
  new_cst: IConstituentaMeta;
  schema: IRSFormData;
}

/**
 * Represents data response when creating producing structure of {@link IConstituenta}.
 */
export interface IProduceStructureResponse {
  cst_list: ConstituentaID[];
  schema: IRSFormData;
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
 * Represents data for {@link IRSForm} provided by backend.
 */
export interface IRSFormData extends ILibraryItemVersioned {
  items: IConstituentaData[];
  inheritance: ConstituentaID[][];
  oss: ILibraryItemReference[];
}

/**
 * Represents formal explication for set of concepts.
 */
export interface IRSForm extends IRSFormData {
  items: IConstituenta[];
  stats: IRSFormStats;
  graph: Graph;
  cstByAlias: Map<string, IConstituenta>;
  cstByID: Map<ConstituentaID, IConstituenta>;
}

/**
 * Represents data, used for cloning {@link IRSForm}.
 */
export interface IRSFormCloneData extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'id' | 'owner'> {
  items?: ConstituentaID[];
}

/**
 * Represents data, used for uploading {@link IRSForm} as file.
 */
export interface IRSFormUploadData {
  load_metadata: boolean;
  file: File;
  fileName: string;
}

/**
 * Represents data response when creating {@link IVersionInfo}.
 */
export interface IVersionCreatedResponse {
  version: number;
  schema: IRSFormData;
}

/**
 * Represents single substitution for binary synthesis table.
 */
export interface IBinarySubstitution {
  leftCst: IConstituenta;
  rightCst: IConstituenta;
  deleteRight: boolean;
}

/**
 * Represents input data for inline synthesis.
 */
export interface IInlineSynthesisData {
  receiver: LibraryItemID;
  source: LibraryItemID;
  items: ConstituentaID[];
  substitutions: ICstSubstitute[];
}
