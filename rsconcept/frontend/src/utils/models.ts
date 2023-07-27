// ========= Users ===========
export interface IUser {
  id: number | null
  username: string
  is_staff: boolean
  email: string
  first_name: string
  last_name: string
}

export interface ICurrentUser extends Pick<IUser, 'id' | 'username' | 'is_staff'> {}

export interface IUserLoginData extends Pick<IUser, 'username'> {
  password: string
}

export interface IUserSignupData extends Omit<IUser, 'is_staff' | 'id'> {
  password: string
  password2: string
}
export interface IUserProfile extends Omit<IUser, 'is_staff'> {}
export interface IUserInfo extends Omit<IUserProfile, 'email'> {}

// ======== Parsing ============
// ValueClass
export enum ValueClass {
  INVALID = 'invalid',
  VALUE = 'value',
  PROPERTY = 'property'
}

// Syntax
export enum Syntax {
  UNDEF = 'undefined',
  ASCII = 'ascii',
  MATH = 'math'
}

// ParsingStatus
export enum ParsingStatus {
  UNDEF = 'undefined',
  VERIFIED = 'verified',
  INCORRECT = 'incorrect'
}

export interface RSErrorDescription {
  errorType: number
  position: number
  isCritical: boolean
  params: string[]
}

export interface ExpressionParse {
  parseResult: boolean
  syntax: Syntax
  typification: string
  valueClass: ValueClass
  astText: string
  errors: RSErrorDescription[]
}

export interface RSExpression {
  expression: string
}

// ====== Constituenta ==========
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

export interface IConstituenta {
  id: number
  alias: string
  cstType: CstType
  convention: string
  term: {
    raw: string
    resolved: string
    forms: string[]
  }
  definition: {
    formal: string
    text: {
      raw: string
      resolved: string
    }
  }
  parse: {
    status: ParsingStatus
    valueClass: ValueClass
    typification: string
    syntaxTree: string
  }
}

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
}

export interface IConstituentaID extends Pick<IConstituentaMeta, 'id'>{}
export interface IConstituentaList {
  items: IConstituentaID[]
}

export interface ICstCreateData extends Pick<IConstituentaMeta, 'alias' | 'cst_type'> {
  insert_after: number | null
}

export interface ICstMovetoData extends IConstituentaList {
  move_to: number
}

export interface ICstUpdateData
extends Pick<IConstituentaMeta, 'id' | 'alias' | 'convention' | 'definition_formal' | 'definition_raw' | 'term_raw'> {}

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

  count_base: number
  count_constant: number
  count_structured: number
  count_axiom: number
  count_term: number
  count_function: number
  count_predicate: number
  count_theorem: number
}

export interface IRSForm {
  id: number
  title: string
  alias: string
  comment: string
  is_common: boolean
  time_create: string
  time_update: string
  owner: number | null
  items: IConstituenta[]
  stats: IRSFormStats
}

export interface IRSFormData extends Omit<IRSForm, 'stats' > {}
export interface IRSFormMeta extends Omit<IRSForm, 'items' | 'stats'> {}

export interface IRSFormUpdateData
extends Omit<IRSFormMeta, 'time_create' | 'time_update' | 'id' | 'owner'> {}

export interface IRSFormCreateData
extends IRSFormUpdateData {
  file?: File
  fileName?: string
}

export interface IRSFormUploadData {
  load_metadata: boolean
  file: File
  fileName: string
}

// ================ Misc types ================
// Constituenta edit mode
export enum EditMode {
  TEXT = 'text',
  RSLANG = 'rslang'
}

// RSExpression status
export enum ExpressionStatus {
  UNDEFINED = 0,
  UNKNOWN,
  INCORRECT,
  INCALCULABLE,
  PROPERTY,
  VERIFIED
}

export function inferStatus(parse?: ParsingStatus, value?: ValueClass): ExpressionStatus {
  if (!parse || !value) {
    return ExpressionStatus.UNDEFINED;
  }
  if (parse === ParsingStatus.UNDEF) {
    return ExpressionStatus.UNKNOWN;
  }
  if (parse === ParsingStatus.INCORRECT) {
    return ExpressionStatus.INCORRECT;
  }
  if (value === ValueClass.INVALID) {
    return ExpressionStatus.INCALCULABLE;
  }
  if (value === ValueClass.PROPERTY) {
    return ExpressionStatus.PROPERTY;
  }
  return ExpressionStatus.VERIFIED
}

export function LoadRSFormData(schema: IRSFormData): IRSForm {
  const result = schema as IRSForm
  if (!result.items) {
    result.stats = {
      count_all: 0,
      count_errors: 0,
      count_property: 0,
      count_incalc: 0,

      count_termin: 0,

      count_base: 0,
      count_constant: 0,
      count_structured: 0,
      count_axiom: 0,
      count_term: 0,
      count_function: 0,
      count_predicate: 0,
      count_theorem: 0
    }
    return result;
  }
  result.stats = {
    count_all: schema.items.length || 0,
    count_errors: schema.items.reduce(
      (sum, cst) => sum + (cst.parse?.status === ParsingStatus.INCORRECT ? 1 : 0) || 0, 0),
    count_property: schema.items.reduce(
      (sum, cst) => sum + (cst.parse?.valueClass === ValueClass.PROPERTY ? 1 : 0) || 0, 0),
    count_incalc: schema.items.reduce(
      (sum, cst) => sum +
      ((cst.parse?.status === ParsingStatus.VERIFIED && cst.parse?.valueClass === ValueClass.INVALID) ? 1 : 0) || 0, 0),

    count_termin: schema.items.reduce(
      (sum, cst) => (sum + (cst.term?.raw ? 1 : 0) || 0), 0),

    count_base: schema.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.BASE ? 1 : 0), 0),
    count_constant: schema.items?.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.CONSTANT ? 1 : 0), 0),
    count_structured: schema.items?.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.STRUCTURED ? 1 : 0), 0),
    count_axiom: schema.items?.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.AXIOM ? 1 : 0), 0),
    count_term: schema.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.TERM ? 1 : 0), 0),
    count_function: schema.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.FUNCTION ? 1 : 0), 0),
    count_predicate: schema.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.PREDICATE ? 1 : 0), 0),
    count_theorem: schema.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.THEOREM ? 1 : 0), 0)
  }
  return result;
}

export function matchConstituenta(query: string, target?: IConstituenta) {
  if (!target) {
    return false;
  } else if (target.alias.match(query)) {
    return true;
  } else if (target.term?.resolved?.match(query)) {
    return true;
  } else if (target.definition?.formal.match(query)) {
    return true;
  } else if (target.definition?.text.resolved?.match(query)) {
    return true;
  } else if (target.convention?.match(query)) {
    return true;
  } else {
    return false;
  }
}
