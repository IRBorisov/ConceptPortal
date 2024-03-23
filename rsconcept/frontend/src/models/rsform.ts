/**
 * Module: Models for formal representation for systems of concepts.
 */

import { Graph } from '@/models/Graph';

import { ILibraryItemEx, ILibraryUpdateData, LibraryItemID } from './library';
import { IArgumentInfo, ParsingStatus, ValueClass } from './rslang';

/**
 * Represents Constituenta type.
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

// CstType constant for category dividers in TemplateSchemas. TODO: create separate structure for templates
export const CATEGORY_CST_TYPE = CstType.THEOREM;

/**
 * Represents position in linear order.
 */
export type Position = number;

/**
 * Represents {@link Constituenta} identifier type.
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
export interface ICstTarget {
  target: ConstituentaID;
}

/**
 * Represents Constituenta.
 */
export interface IConstituenta extends IConstituentaMeta {
  cst_class: CstClass;
  status: ExpressionStatus;
  is_template: boolean;
  parse: {
    status: ParsingStatus;
    valueClass: ValueClass;
    typification: string;
    syntaxTree: string;
    args: IArgumentInfo[];
  };
}

/**
 * Represents Constituenta list.
 */
export interface IConstituentaList {
  items: ConstituentaID[];
}

/**
 * Represents constituenta data, used in creation process.
 */
export interface ICstCreateData
  extends Pick<
    IConstituentaMeta,
    'alias' | 'cst_type' | 'definition_raw' | 'term_raw' | 'convention' | 'definition_formal' | 'term_forms'
  > {
  insert_after: ConstituentaID | null;
}

/**
 * Represents data, used in ordering constituents in a list.
 */
export interface ICstMovetoData extends IConstituentaList {
  move_to: Position;
}

/**
 * Represents data, used in updating persistent attributes in {@link IConstituenta}.
 */
export interface ICstUpdateData
  extends Pick<IConstituentaMeta, 'id'>,
    Partial<
      Pick<
        IConstituentaMeta,
        'alias' | 'convention' | 'definition_formal' | 'definition_raw' | 'term_raw' | 'term_forms'
      >
    > {}

/**
 * Represents data, used in renaming {@link IConstituenta}.
 */
export interface ICstRenameData extends ICstTarget, Pick<IConstituentaMeta, 'alias' | 'cst_type'> {}

/**
 * Represents data, used in merging {@link IConstituenta}.
 */
export interface ICstSubstituteData {
  original: ConstituentaID;
  substitution: ConstituentaID;
  transfer_term: boolean;
}

/**
 * Represents single substitution for synthesis table.
 */
export interface ISubstitution {
  leftCst: IConstituenta;
  rightCst: IConstituenta;
  deleteRight: boolean;
  takeLeftTerm: boolean;
}

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
 * Represents formal explication for set of concepts.
 */
export interface IRSForm extends ILibraryItemEx {
  items: IConstituenta[];
  stats: IRSFormStats;
  graph: Graph;
}

/**
 * Represents data for {@link IRSForm} provided by backend.
 */
export interface IRSFormData extends Omit<IRSForm, 'stats' | 'graph'> {}

/**
 * Represents data, used for creating {@link IRSForm}.
 */
export interface IRSFormCreateData extends ILibraryUpdateData {
  file?: File;
  fileName?: string;
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
 * Represents input data for inline synthesis.
 */
export interface IInlineSynthesisData {
  receiver: LibraryItemID;
  source: LibraryItemID;
  items: ConstituentaID[];
  substitutions: ICstSubstituteData[];
}
