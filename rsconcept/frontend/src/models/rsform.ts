import { Graph } from '../utils/Graph'
import { ILibraryUpdateData } from './library'
import { ILibraryItem } from './library'
import { IArgumentInfo, ParsingStatus, ValueClass } from './rslang'

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

// CstType constant for category dividers in TemplateSchemas. TODO: create separate sctructure for templates
export const CATEGORY_CST_TYPE = CstType.THEOREM;

export enum CstClass {
  BASIC = 'basic',
  DERIVED = 'derived',
  STATEMENT = 'statement',
  TEMPLATE = 'template'
}

// Constituenta expression status
export enum ExpressionStatus {
  VERIFIED = 'verified',
  INCORRECT = 'incorrect',
  INCALCULABLE = 'incalculable',
  PROPERTY = 'property',
  UNDEFINED = 'undefined',
  UNKNOWN = 'unknown',
}

export interface TermForm {
  text: string
  tags: string
}

// ====== Constituenta ==========
export interface IConstituentaMeta {
  id: number
  schema: number
  order: number
  alias: string
  convention: string
  cst_type: CstType
  definition_formal: string
  definition_raw: string
  definition_resolved: string
  term_raw: string
  term_resolved: string
  term_forms: TermForm[]
}

export interface IConstituenta
extends IConstituentaMeta {
  cst_class: CstClass
  status: ExpressionStatus
  is_template: boolean
  parse: {
    status: ParsingStatus
    valueClass: ValueClass
    typification: string
    syntaxTree: string
    args: IArgumentInfo[]
  }
}

export interface IConstituentaList {
  items: number[]
}

export interface ICstCreateData 
extends Pick<
  IConstituentaMeta, 
  'alias' | 'cst_type' | 'definition_raw' | 'term_raw' |
  'convention' | 'definition_formal' | 'term_forms'
> {
  insert_after: number | null
}

export interface ICstMovetoData extends IConstituentaList {
  move_to: number
}

export interface ICstUpdateData
extends Pick<IConstituentaMeta, 'id'>,
Partial<Pick<IConstituentaMeta, | 'alias' | 'convention' | 'definition_formal' | 'definition_raw' | 'term_raw' | 'term_forms'>> {}

export interface ICstRenameData 
extends Pick<IConstituentaMeta, 'id' | 'alias' | 'cst_type' > {}

export interface ICstCreatedResponse {
  new_cst: IConstituentaMeta
  schema: IRSFormData
}

// ========== RSForm ============
export interface IRSFormStats {
  count_all: number
  count_errors: number
  count_property: number
  count_incalc: number

  count_termin: number
  count_definition: number
  count_convention: number

  count_base: number
  count_constant: number
  count_structured: number
  count_axiom: number
  count_term: number
  count_function: number
  count_predicate: number
  count_theorem: number
}

export interface IRSForm
extends ILibraryItem {
  items: IConstituenta[]
  stats: IRSFormStats
  graph: Graph
  subscribers: number[]
}

export interface IRSFormData extends Omit<IRSForm, 'stats' | 'graph'> {}

export interface IRSFormCreateData
extends ILibraryUpdateData {
  file?: File
  fileName?: string
}

export interface IRSFormUploadData {
  load_metadata: boolean
  file: File
  fileName: string
}