/**
 * Module: API for formal representation for systems of concepts.
 */

import { BASIC_SCHEMAS, type LibraryItem } from '@/features/library';
import { type AnalysisFull, TypeClass, ValueClass } from '@/features/rslang';

import { type RO } from '@/utils/meta';
import { TextMatcher } from '@/utils/utils';

import { CstMatchMode } from '../stores/cst-search';

import {
  type ArgumentValue, CATEGORY_CST_TYPE,
  type Constituenta, CstClass, CstStatus,
  CstType, type RSForm,
  type RSFormStats
} from './rsform';

/**
 * Checks if a given target {@link Constituenta} matches the specified query using the provided matching mode.
 *
 * @param target - The target object to be matched.
 * @param query - The query string used for matching.
 * @param mode - The matching mode to determine which properties to include in the matching process.
 */
export function matchConstituenta(target: RO<Constituenta>, query: string, mode: CstMatchMode): boolean {
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
 * - `ExpressionStatus.INCORRECT` if parsing failed.
 * - `ExpressionStatus.INCALCULABLE` if value is `ValueClass.INVALID`.
 * - `ExpressionStatus.PROPERTY` if value is `ValueClass.PROPERTY`.
 * - `ExpressionStatus.VERIFIED` if both parsing and value are valid.
 */
export function inferStatus(parse: boolean, value?: ValueClass | null): CstStatus {
  if (!parse) {
    return CstStatus.INCORRECT;
  }
  if (value === null) {
    return CstStatus.INCALCULABLE;
  }
  if (value === ValueClass.PROPERTY) {
    return CstStatus.PROPERTY;
  }
  return CstStatus.VERIFIED;
}

/** Infers type of constituent for a given template and arguments. */
export function inferTemplatedType(templateType: CstType, args: RO<ArgumentValue[]>): CstType {
  if (args.length === 0 || args.some(arg => !arg.value)) {
    return templateType;
  } else if (templateType === CstType.PREDICATE) {
    return CstType.AXIOM;
  } else {
    return CstType.TERM;
  }
}

/** Checks if given expression is a template. */
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
export function inferClass(type: CstType, isTemplate: boolean = false): CstClass {
  if (isTemplate) {
    return CstClass.TEMPLATE;
  }
  // prettier-ignore
  switch (type) {
    case CstType.NOMINAL: return CstClass.NOMINAL;
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

/** Check if {@link Constituenta} is a template or a category. */
export function isTemplateCst(cst: Constituenta): boolean {
  return cst.cst_type === CstType.FUNCTION || cst.cst_type === CstType.PREDICATE || cst.cst_type === CstType.THEOREM;
}

/** Apply filter based on start {@link Constituenta} type. */
export function applyFilterCategory(start: Constituenta, items: Constituenta[]): Constituenta[] {
  const startIndex = items.indexOf(start);
  if (startIndex === -1) {
    return [];
  }
  const nextCategoryIndex = items.findIndex((cst, index) => index > startIndex && cst.cst_type === CATEGORY_CST_TYPE);

  return items.filter((_, index) => index >= startIndex && (nextCategoryIndex === -1 || index < nextCategoryIndex));
}

const cstTypePrefixRecord: Record<CstType, string> = {
  [CstType.NOMINAL]: 'N',
  [CstType.BASE]: 'X',
  [CstType.CONSTANT]: 'C',
  [CstType.STRUCTURED]: 'S',
  [CstType.AXIOM]: 'A',
  [CstType.TERM]: 'D',
  [CstType.FUNCTION]: 'F',
  [CstType.PREDICATE]: 'P',
  [CstType.THEOREM]: 'T'
};

/** Prefix for alias indicating {@link CstType}. */
export function getCstTypePrefix(type: CstType): string {
  return cstTypePrefixRecord[type];
}

/** Guess {@link CstType} from user input hint. */
export function guessCstType(hint: string, defaultType: CstType = CstType.TERM): CstType {
  if (hint.length !== 1) {
    return defaultType;
  }
  // prettier-ignore
  switch (hint) {
    case 'N': return CstType.NOMINAL;
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

/** Evaluate if {@link CstType} is basic concept. */
export function isBasicConcept(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.NOMINAL: return true;
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

/** Evaluate if {@link CstType} is base set or constant set. */
export function isBaseSet(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.NOMINAL: return false;
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

/** Evaluate if {@link CstType} is a function. */
export function isFunctional(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.NOMINAL: return false;
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

/** Evaluate if {@link CstType} is logical. */
export function isLogical(type: CstType): boolean {
  // prettier-ignore
  switch (type) {
    case CstType.NOMINAL: return false;
    case CstType.BASE: return false;
    case CstType.CONSTANT: return false;
    case CstType.STRUCTURED: return false;
    case CstType.AXIOM: return true;
    case CstType.TERM: return false;
    case CstType.FUNCTION: return false;
    case CstType.PREDICATE: return false;
    case CstType.THEOREM: return true;
  }
}

/** Evaluate if {@link Constituenta} can be used produce structure. */
export function canProduceStructure(cst: RO<Constituenta>): boolean {
  return (
    !!cst.analysis?.success &&
    cst.analysis.type !== null &&
    cst.cst_type !== CstType.BASE &&
    cst.cst_type !== CstType.CONSTANT &&
    cst.cst_type !== CstType.NOMINAL
  );
}

/** Validate new alias against {@link CstType} and {@link RSForm}. */
export function validateNewAlias(alias: string, type: CstType, schema: RSForm): boolean {
  if (alias.length < 2) {
    return false;
  }
  const prefix = getCstTypePrefix(type);
  if (!alias.startsWith(prefix)) {
    return false;
  }
  if (schema.cstByAlias.has(alias)) {
    return false;
  }
  if (!/^\d+$/.exec(alias.substring(prefix.length))) {
    return false;
  }
  return true;
}

/**
 * Definition prefix for {@link Constituenta}.
 */
export function getDefinitionPrefix(cst: Constituenta): string {
  return cst.alias + (cst.cst_type === CstType.STRUCTURED ? '::=' : ':==');
}

/**
 * Generate alias for new {@link Constituenta} of a given {@link CstType} for current {@link RSForm}.
 */
export function generateAlias(type: CstType, schema: RSForm, takenAliases: string[] = []): string {
  const prefix = getCstTypePrefix(type);
  if (schema.items.length <= 0) {
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

/** Sorts library items relevant for InlineSynthesis with specified {@link RSForm}. */
export function sortItemsForInlineSynthesis(receiver: RSForm, items: readonly LibraryItem[]): LibraryItem[] {
  const result = items.filter(item => item.location === receiver.location);
  for (const item of items) {
    if (item.visible && item.owner === item.owner && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (!result.includes(item) && item.location.startsWith(BASIC_SCHEMAS)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (item.visible && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

/** Remove alias from expression. */
export function removeAliasReference(expression: string, alias: string): string {
  const result = expression.replaceAll(new RegExp(`\\b${alias}\\b`, 'g'), 'DEL');
  return result === 'DEL' ? '' : result;
}

/** Add alias to expression. */
export function addAliasReference(expression: string, alias: string): string {
  return expression + ' ' + alias;
}

/** Returns expected {@link TypeClass} of formal definition for {@link CstType}. */
export function typeClassForCstType(cstType: CstType): TypeClass {
  switch (cstType) {
    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.TERM:
      return TypeClass.typification;
    case CstType.FUNCTION:
      return TypeClass.function;
    case CstType.PREDICATE:
      return TypeClass.predicate;
    case CstType.AXIOM:
    case CstType.THEOREM:
      return TypeClass.logic;
  }
}

/** Analyze expression for {@link RSForm}. */
export function getAnalysisFor(expression: string, cstType: CstType, schema: RSForm): AnalysisFull {
  return schema.analyzer.checkFull(expression, {
    expected: typeClassForCstType(cstType),
    isDomain: cstType === CstType.STRUCTURED,
  });
}

/** Calculate statistics for {@link RSForm}. */
export function calculateSchemaStats(target: RSForm): RSFormStats {
  const items = target.items;
  return {
    count_all: items.length,
    count_crucial: items.reduce((sum, cst) => sum + (cst.crucial ? 1 : 0), 0),
    count_errors: items.reduce((sum, cst) => sum + (!cst.analysis?.success ? 1 : 0), 0),
    count_property: items.reduce((sum, cst) => sum + (cst.analysis?.valueClass === ValueClass.PROPERTY ? 1 : 0), 0),
    count_incalculable: items.reduce(
      (sum, cst) =>
        sum + (cst.analysis?.success && cst.analysis.valueClass === null ? 1 : 0),
      0
    ),
    count_inherited: items.reduce((sum, cst) => sum + (cst.is_inherited ? 1 : 0), 0),

    count_text_term: items.reduce((sum, cst) => sum + (cst.term_raw ? 1 : 0), 0),
    count_definition: items.reduce((sum, cst) => sum + (cst.definition_raw ? 1 : 0), 0),
    count_convention: items.reduce((sum, cst) => sum + (cst.convention ? 1 : 0), 0),

    count_base: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.BASE ? 1 : 0), 0),
    count_constant: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.CONSTANT ? 1 : 0), 0),
    count_structured: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.STRUCTURED ? 1 : 0), 0),
    count_axiom: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.AXIOM ? 1 : 0), 0),
    count_term: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.TERM ? 1 : 0), 0),
    count_function: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.FUNCTION ? 1 : 0), 0),
    count_predicate: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.PREDICATE ? 1 : 0), 0),
    count_theorem: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.THEOREM ? 1 : 0), 0),
    count_nominal: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.NOMINAL ? 1 : 0), 0)
  };
}
