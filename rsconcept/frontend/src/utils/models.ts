import { RSErrorType, TokenID } from './enums'
import { Graph } from './Graph'

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
export interface IUserUpdateData extends Omit<IUser, 'is_staff' | 'id'> {}
export interface IUserProfile extends Omit<IUser, 'is_staff'> {}
export interface IUserInfo extends Omit<IUserProfile, 'email'> {}

export interface IUserUpdatePassword {
  old_password: string
  new_password: string
}

// ======== RS Parsing ============
export enum Syntax {
  UNDEF = 'undefined',
  ASCII = 'ascii',
  MATH = 'math'
}

export enum ValueClass {
  INVALID = 'invalid',
  VALUE = 'value',
  PROPERTY = 'property'
}

export enum ParsingStatus {
  UNDEF = 'undefined',
  VERIFIED = 'verified',
  INCORRECT = 'incorrect'
}

export interface IRSErrorDescription {
  errorType: RSErrorType
  position: number
  isCritical: boolean
  params: string[]
}

export interface ISyntaxTreeNode {
  uid: number
  parent: number
  typeID: TokenID
  start: number
  finish: number
  data: {
    dataType: string,
    value: unknown
  }
}
export type SyntaxTree = ISyntaxTreeNode[]

export interface IFunctionArg {
  alias: string
  typification: string
}

export interface IExpressionParse {
  parseResult: boolean
  syntax: Syntax
  typification: string
  valueClass: ValueClass
  errors: IRSErrorDescription[]
  astText: string
  ast: SyntaxTree
  args: IFunctionArg[]
}

export interface IRSExpression {
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

export enum CstClass {
  BASIC = 'basic',
  DERIVED = 'derived',
  STATEMENT = 'statement',
  TEMPLATE = 'template'
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
  cstClass: CstClass
  status: ExpressionStatus
  isTemplate: boolean
  parse: {
    status: ParsingStatus
    valueClass: ValueClass
    typification: string
    syntaxTree: string
    args: IFunctionArg[]
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

export interface ICstCreateData 
extends Pick<IConstituentaMeta, 'alias' | 'cst_type' | 'definition_raw' | 'term_raw' | 'convention' | 'definition_formal' > {
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
  graph: Graph
}

export interface IRSFormData extends Omit<IRSForm, 'stats' | 'graph'> {}
export interface IRSFormMeta extends Omit<IRSForm, 'items' | 'stats' | 'graph'> {}

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

// ========== Library =====
export interface ILibraryFilter {
  ownedBy?: number
  is_common?: boolean
  queryMeta?: string
}

// ================ Misc types ================
// Constituenta edit mode
export enum EditMode {
  TEXT = 'text',
  RSLANG = 'rslang'
}

// RSExpression status
export enum ExpressionStatus {
  UNDEFINED = 'undefined',
  UNKNOWN = 'unknown',
  INCORRECT = 'incorrect',
  INCALCULABLE = 'incalculable',
  PROPERTY = 'property',
  VERIFIED = 'verified'
}

// Dependency mode for schema analysis
export enum DependencyMode {
  ALL = 0,
  EXPRESSION,
  OUTPUTS,
  INPUTS,
  EXPAND_OUTPUTS,
  EXPAND_INPUTS
}

// Constituent compare mode
export enum CstMatchMode {
  ALL = 1,
  EXPR,
  TERM,
  TEXT,
  NAME
}

// ========== Model functions =================
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
  return ExpressionStatus.VERIFIED;
}

export function inferTemplate(expression: string): boolean {
  const match = expression.match(/R\d+/g);
  return (match && match?.length > 0) ?? false;
}

export function inferClass(type: CstType, isTemplate: boolean): CstClass {
  if (isTemplate) {
    return CstClass.TEMPLATE;
  }
  switch (type) {
  case CstType.BASE: return CstClass.BASIC;
  case CstType.CONSTANT: return CstClass.BASIC;
  case CstType.STRUCTURED: return CstClass.BASIC;
  case CstType.TERM: return CstClass.DERIVED;
  case CstType.FUNCTION: return CstClass.DERIVED;
  case CstType.AXIOM: return CstClass.STATEMENT;
  case CstType.PREDICATE: return CstClass.DERIVED;
  case CstType.THEOREM: return CstClass.STATEMENT;
  }
}

export function extractGlobals(expression: string): Set<string> {
  return new Set(expression.match(/[XCSADFPT]\d+/g) ?? []);
}

export function LoadRSFormData(schema: IRSFormData): IRSForm {
  const result = schema as IRSForm
  result.graph = new Graph;
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
    count_all: result.items.length || 0,
    count_errors: result.items.reduce(
      (sum, cst) => sum + (cst.parse?.status === ParsingStatus.INCORRECT ? 1 : 0) || 0, 0),
    count_property: result.items.reduce(
      (sum, cst) => sum + (cst.parse?.valueClass === ValueClass.PROPERTY ? 1 : 0) || 0, 0),
    count_incalc: result.items.reduce(
      (sum, cst) => sum +
      ((cst.parse?.status === ParsingStatus.VERIFIED && cst.parse?.valueClass === ValueClass.INVALID) ? 1 : 0) || 0, 0),

    count_termin: result.items.reduce(
      (sum, cst) => (sum + (cst.term?.raw ? 1 : 0) || 0), 0),

    count_base: result.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.BASE ? 1 : 0), 0),
    count_constant: result.items?.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.CONSTANT ? 1 : 0), 0),
    count_structured: result.items?.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.STRUCTURED ? 1 : 0), 0),
    count_axiom: result.items?.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.AXIOM ? 1 : 0), 0),
    count_term: result.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.TERM ? 1 : 0), 0),
    count_function: result.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.FUNCTION ? 1 : 0), 0),
    count_predicate: result.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.PREDICATE ? 1 : 0), 0),
    count_theorem: result.items.reduce(
      (sum, cst) => sum + (cst.cstType === CstType.THEOREM ? 1 : 0), 0)
  }
  result.items.forEach(cst => {
    cst.status = inferStatus(cst.parse.status, cst.parse.valueClass);
    cst.isTemplate = inferTemplate(cst.definition.formal);
    cst.cstClass = inferClass(cst.cstType, cst.isTemplate);
    result.graph.addNode(cst.id);
    const dependencies = extractGlobals(cst.definition.formal);
    dependencies.forEach(value => {
      const source = schema.items.find(cst => cst.alias === value)
      if (source) {
        result.graph.addEdge(source.id, cst.id);
      }
    });
  });
  return result;
}

export function matchConstituenta(query: string, target: IConstituenta, mode: CstMatchMode) {
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.NAME) && 
    target.alias.match(query)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.TERM) && 
    target.term.resolved.match(query)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.EXPR) && 
    target.definition.formal.match(query)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.TEXT)) {
    return (target.definition.text.resolved.match(query) || target.convention.match(query));
  }
  return false;
}

export function matchRSFormMeta(query: string, target: IRSFormMeta) {
  const queryI = query.toUpperCase();
  if (target.alias.toUpperCase().match(queryI)) {
    return true;
  } else if (target.title.toUpperCase().match(queryI)) {
    return true;
  } else {
    return false;
  }
}

export function applyGraphFilter(schema: IRSForm, start: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return schema.items;
  }
  let ids: number[] | undefined = undefined
  switch (mode) {
  case DependencyMode.OUTPUTS: { ids = schema.graph.nodes.get(start)?.outputs; break; }
  case DependencyMode.INPUTS: { ids = schema.graph.nodes.get(start)?.inputs; break; }
  case DependencyMode.EXPAND_OUTPUTS: { ids = schema.graph.expandOutputs([start]) ; break; }
  case DependencyMode.EXPAND_INPUTS: { ids = schema.graph.expandInputs([start]) ; break; }
  }
  if (!ids) {
    return schema.items;
  } else {
    return schema.items.filter(cst => ids!.find(id => id === cst.id));
  }
}