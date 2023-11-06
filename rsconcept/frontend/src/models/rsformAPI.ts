// ========== RSForm API =================
import { Graph } from '../utils/Graph';
import { TextMatcher } from '../utils/utils';
import { CstMatchMode } from './miscelanious';
import {
  CATEGORY_CST_TYPE, CstClass, CstType, 
  ExpressionStatus, IConstituenta, IRSForm, IRSFormData
} from './rsform';
import { ParsingStatus, ValueClass } from './rslang';
import { extractGlobals } from './rslangAPI';

export function loadRSFormData(schema: IRSFormData): IRSForm {
  const result = schema as IRSForm
  result.graph = new Graph;
  if (!result.items) {
    result.stats = {
      count_all: 0,
      count_errors: 0,
      count_property: 0,
      count_incalc: 0,

      count_termin: 0,
      count_definition: 0,
      count_convention: 0,

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
      (sum, cst) => (sum + (cst.term_raw ? 1 : 0) || 0), 0),
    count_definition: result.items.reduce(
      (sum, cst) => (sum + (cst.definition_raw ? 1 : 0) || 0), 0),
    count_convention: result.items.reduce(
      (sum, cst) => (sum + (cst.convention ? 1 : 0) || 0), 0),

    count_base: result.items.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.BASE ? 1 : 0), 0),
    count_constant: result.items?.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.CONSTANT ? 1 : 0), 0),
    count_structured: result.items?.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.STRUCTURED ? 1 : 0), 0),
    count_axiom: result.items?.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.AXIOM ? 1 : 0), 0),
    count_term: result.items.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.TERM ? 1 : 0), 0),
    count_function: result.items.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.FUNCTION ? 1 : 0), 0),
    count_predicate: result.items.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.PREDICATE ? 1 : 0), 0),
    count_theorem: result.items.reduce(
      (sum, cst) => sum + (cst.cst_type === CstType.THEOREM ? 1 : 0), 0)
  }
  result.items.forEach(cst => {
    cst.status = inferStatus(cst.parse.status, cst.parse.valueClass);
    cst.is_template = inferTemplate(cst.definition_formal);
    cst.cst_class = inferClass(cst.cst_type, cst.is_template);
    result.graph.addNode(cst.id);
    const dependencies = extractGlobals(cst.definition_formal);
    dependencies.forEach(value => {
      const source = schema.items.find(cst => cst.alias === value)
      if (source) {
        result.graph.addEdge(source.id, cst.id);
      }
    });
  });
  return result;
}

export function matchConstituenta(target: IConstituenta, query: string, mode: CstMatchMode): boolean {
  const matcher = new TextMatcher(query);
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.NAME) && 
    matcher.test(target.alias)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.TERM) && 
    matcher.test(target.term_resolved)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.EXPR) && 
    matcher.test(target.definition_formal)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.TEXT)) {
    return (matcher.test(target.definition_resolved) || matcher.test(target.convention));
  }
  return false;
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

export function isMockCst(cst: IConstituenta) {
  return cst.id <= 0;
}

export function createMockConstituenta(schema: number, id: number, alias: string, type: CstType, comment: string): IConstituenta {
  return {
    id: id,
    order: -1,
    schema: schema,
    alias: alias,
    convention: comment,
    cst_type: type,
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    definition_formal: '',
    definition_raw: '',
    definition_resolved: '',
    status: ExpressionStatus.INCORRECT,
    is_template: false,
    cst_class: CstClass.DERIVED,
    parse: {
      status: ParsingStatus.INCORRECT,
      valueClass: ValueClass.INVALID,
      typification: 'N/A',
      syntaxTree: '',
      args: []
    }
  };
}

export function applyFilterCategory(target: IConstituenta, schema: IRSFormData): IConstituenta[] {
  const nextCategory = schema.items.find(
    cst => (
      cst.order > target.order &&
      cst.cst_type === CATEGORY_CST_TYPE
    )
  );
  return schema.items.filter(
    cst => (
      cst.order > target.order &&
      (!nextCategory || cst.order <= nextCategory.order)
    )
  );
}

