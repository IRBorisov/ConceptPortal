/**
 * Module: API for formal representation for systems of concepts.
 */

import { TextMatcher } from '@/utils/utils';

import { CstMatchMode } from './miscellaneous';
import {
  CATEGORY_CST_TYPE,
  ConstituentaID,
  CstClass,
  CstType,
  ExpressionStatus,
  IConstituenta,
  IRSForm
} from './rsform';
import { ParsingStatus, ValueClass } from './rslang';

/**
 * Checks if a given target {@link IConstituenta} matches the specified query using the provided matching mode.
 *
 * @param target - The target object to be matched.
 * @param query - The query string used for matching.
 * @param mode - The matching mode to determine which properties to include in the matching process.
 */
export function matchConstituenta(target: IConstituenta, query: string, mode: CstMatchMode): boolean {
  const matcher = new TextMatcher(query);
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.NAME) && matcher.test(target.alias)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.TERM) && matcher.test(target.term_resolved)) {
    return true;
  }
  if ((mode === CstMatchMode.ALL || mode === CstMatchMode.EXPR) && matcher.test(target.definition_formal)) {
    return true;
  }
  if (mode === CstMatchMode.ALL || mode === CstMatchMode.TEXT) {
    return matcher.test(target.definition_resolved) || matcher.test(target.convention);
  }
  return false;
}

/**
 * Infers the status of an expression based on parsing and value information.
 *
 * @param parse - parsing status of the expression.
 * @param value - value class of the expression.
 *
 * @returns The inferred expression status:
 * - `ExpressionStatus.UNDEFINED` if either parsing or value is not provided.
 * - `ExpressionStatus.UNKNOWN` if parsing status is `ParsingStatus.UNDEF`.
 * - `ExpressionStatus.INCORRECT` if parsing status is `ParsingStatus.INCORRECT`.
 * - `ExpressionStatus.INCALCULABLE` if value is `ValueClass.INVALID`.
 * - `ExpressionStatus.PROPERTY` if value is `ValueClass.PROPERTY`.
 * - `ExpressionStatus.VERIFIED` if both parsing and value are valid.
 */
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

/**
 * Checks if given expression is a template.
 */
export function inferTemplate(expression: string): boolean {
  const match = expression.match(/R\d+/g);
  return (match && match?.length > 0) ?? false;
}

/**
 * Infers the {@link CstClass} based on the provided {@link CstType} and template status.
 *
 * @param type - The CstType representing the type of the Constituenta.
 * @param isTemplate - A boolean indicating whether the Constituenta is a template.
 *
 * @returns The inferred CstClass based on the combination of CstType and template status:
 * - `CstClass.TEMPLATE` if the Constituenta is a template.
 * - `CstClass.BASIC` if the CstType is BASE, CONSTANT, or STRUCTURED.
 * - `CstClass.DERIVED` if the CstType is TERM, FUNCTION, or PREDICATE.
 * - `CstClass.STATEMENT` if the CstType is AXIOM or THEOREM.
 */
export function inferClass(type: CstType, isTemplate: boolean): CstClass {
  if (isTemplate) {
    return CstClass.TEMPLATE;
  }
  // prettier-ignore
  switch (type) {
    case CstType.BASE:        return CstClass.BASIC;
    case CstType.CONSTANT:    return CstClass.BASIC;
    case CstType.STRUCTURED:  return CstClass.BASIC;
    case CstType.TERM:        return CstClass.DERIVED;
    case CstType.FUNCTION:    return CstClass.DERIVED;
    case CstType.AXIOM:       return CstClass.STATEMENT;
    case CstType.PREDICATE:   return CstClass.DERIVED;
    case CstType.THEOREM:     return CstClass.STATEMENT;
  }
}

/**
 * Creates a mock {@link IConstituenta} object with the provided parameters and default values for other properties.
 */
export function createMockConstituenta(id: ConstituentaID, alias: string, comment: string): IConstituenta {
  return {
    id: id,
    parent: id,
    children: [],
    children_alias: [],
    is_simple_expression: false,
    order: -1,
    schema: -1,
    alias: alias,
    convention: comment,
    cst_type: CstType.BASE,
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    definition_formal: '',
    definition_raw: '',
    definition_resolved: '',
    status: ExpressionStatus.INCORRECT,
    is_template: false,
    is_inherited: false,
    is_inherited_parent: false,
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

/**
 * Checks if given {@link IConstituenta} is mock.
 */
export function isMockCst(cst: IConstituenta) {
  return cst.id <= 0;
}

/**
 * Apply filter based on start {@link IConstituenta} type.
 */
export function applyFilterCategory(start: IConstituenta, schema: IRSForm): IConstituenta[] {
  const nextCategory = schema.items.find(cst => cst.order > start.order && cst.cst_type === CATEGORY_CST_TYPE);
  return schema.items.filter(cst => cst.order >= start.order && (!nextCategory || cst.order < nextCategory.order));
}

/**
 * Prefix for alias indicating {@link CstType}.
 */
export function getCstTypePrefix(type: CstType): string {
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return 'X';
    case CstType.CONSTANT: return 'C';
    case CstType.STRUCTURED: return 'S';
    case CstType.AXIOM: return 'A';
    case CstType.TERM: return 'D';
    case CstType.FUNCTION: return 'F';
    case CstType.PREDICATE: return 'P';
    case CstType.THEOREM: return 'T';
  }
}

/**
 * Guess {@link CstType} from user input hint.
 */
export function guessCstType(hint: string, defaultType: CstType = CstType.TERM): CstType {
  if (hint.length !== 1) {
    return defaultType;
  }
  // prettier-ignore
  switch (hint) {
    case 'X': return CstType.BASE;
    case 'C': return CstType.CONSTANT;
    case 'S': return CstType.STRUCTURED;
    case 'A': return CstType.AXIOM;
    case 'D': return CstType.TERM;
    case 'F': return CstType.FUNCTION;
    case 'P': return CstType.PREDICATE;
    case 'T': return CstType.THEOREM;
  }
  return defaultType;
}

/**
 * Evaluate if {@link CstType} is basic concept.
 */
export function isBasicConcept(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return true;
    case CstType.CONSTANT: return true;
    case CstType.STRUCTURED: return true;
    case CstType.AXIOM: return true;
    case CstType.TERM: return false;
    case CstType.FUNCTION: return false;
    case CstType.PREDICATE: return false;
    case CstType.THEOREM: return false;
  }
}

/**
 * Evaluate if {@link CstType} is base set or constant set.
 */
export function isBaseSet(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return true;
    case CstType.CONSTANT: return true;
    case CstType.STRUCTURED: return false;
    case CstType.AXIOM: return false;
    case CstType.TERM: return false;
    case CstType.FUNCTION: return false;
    case CstType.PREDICATE: return false;
    case CstType.THEOREM: return false;
  }
}

/**
 * Evaluate if {@link CstType} is function.
 */
export function isFunctional(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return false;
    case CstType.CONSTANT: return false;
    case CstType.STRUCTURED: return false;
    case CstType.AXIOM: return false;
    case CstType.TERM: return false;
    case CstType.FUNCTION: return true;
    case CstType.PREDICATE: return true;
    case CstType.THEOREM: return false;
  }
}

/**
 * Validate new alias against {@link CstType} and {@link IRSForm}.
 */
export function validateNewAlias(alias: string, type: CstType, schema: IRSForm): boolean {
  return alias.length >= 2 && alias.startsWith(getCstTypePrefix(type)) && !schema.cstByAlias.has(alias);
}

/**
 * Definition prefix for {@link IConstituenta}.
 */
export function getDefinitionPrefix(cst: IConstituenta): string {
  return cst.alias + (cst.cst_type === CstType.STRUCTURED ? '::=' : ':==');
}

/**
 * Generate alias for new {@link IConstituenta} of a given {@link CstType} for current {@link IRSForm}.
 */
export function generateAlias(type: CstType, schema: IRSForm, takenAliases: string[] = []): string {
  const prefix = getCstTypePrefix(type);
  if (!schema.items || schema.items.length <= 0) {
    return `${prefix}1`;
  }
  let index = schema.items.reduce((prev, cst, index) => {
    if (cst.cst_type !== type) {
      return prev;
    }
    index = Number(cst.alias.slice(1 - cst.alias.length)) + 1;
    return Math.max(prev, index);
  }, 1);
  let alias = `${prefix}${index}`;
  while (takenAliases.includes(alias)) {
    index = index + 1;
    alias = `${prefix}${index}`;
  }
  return alias;
}
