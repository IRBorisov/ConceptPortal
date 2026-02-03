/**
 * Module: API for formal representation for systems of concepts.
 */

import { BASIC_SCHEMAS, type ILibraryItem } from '@/features/library';
import { RSLangAnalyzer, TypeClass, ValueClass } from '@/features/rslang';
import { type AnalysisOutput } from '@/features/rslang';

import { type RO } from '@/utils/meta';
import { TextMatcher } from '@/utils/utils';

import { ParsingStatus } from '../backend/types';
import { CstMatchMode } from '../stores/cst-search';

import {
  CATEGORY_CST_TYPE,
  CstClass, CstType, ExpressionStatus,
  type IArgumentValue, type IConstituenta, type IRSForm
} from './rsform';

/**
 * Checks if a given target {@link IConstituenta} matches the specified query using the provided matching mode.
 *
 * @param target - The target object to be matched.
 * @param query - The query string used for matching.
 * @param mode - The matching mode to determine which properties to include in the matching process.
 */
export function matchConstituenta(target: RO<IConstituenta>, query: string, mode: CstMatchMode): boolean {
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

/** Infers type of constituent for a given template and arguments. */
export function inferTemplatedType(templateType: CstType, args: RO<IArgumentValue[]>): CstType {
  if (args.length === 0 || args.some(arg => !arg.value)) {
    return templateType;
  } else if (templateType === CstType.PREDICATE) {
    return CstType.AXIOM;
  } else {
    return CstType.TERM;
  }
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

/** Check if {@link IConstituenta} is a template or a category. */
export function isTemplateCst(cst: IConstituenta): boolean {
  return cst.cst_type === CstType.FUNCTION || cst.cst_type === CstType.PREDICATE || cst.cst_type === CstType.THEOREM;
}

/** Apply filter based on start {@link IConstituenta} type. */
export function applyFilterCategory(start: IConstituenta, items: IConstituenta[]): IConstituenta[] {
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

/**
 * Guess {@link CstType} from user input hint.
 */
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

/**
 * Evaluate if {@link CstType} is basic concept.
 */
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

/**
 * Evaluate if {@link CstType} is base set or constant set.
 */
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

/**
 * Evaluate if {@link CstType} is a function.
 */
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

/**
 * Evaluate if {@link CstType} is logical.
 */
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

/**
 * Evaluate if {@link IConstituenta} can be used produce structure.
 */
export function canProduceStructure(cst: RO<IConstituenta>): boolean {
  return (
    !!cst.parse &&
    !!cst.parse.typification &&
    cst.cst_type !== CstType.BASE &&
    cst.cst_type !== CstType.CONSTANT &&
    cst.cst_type !== CstType.NOMINAL
  );
}

/**
 * Validate new alias against {@link CstType} and {@link IRSForm}.
 */
export function validateNewAlias(alias: string, type: CstType, schema: IRSForm): boolean {
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

/** Sorts library items relevant for InlineSynthesis with specified {@link IRSForm}. */
export function sortItemsForInlineSynthesis(receiver: IRSForm, items: readonly ILibraryItem[]): ILibraryItem[] {
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

export function getAnalysisFor(expression: string, cst: IConstituenta, schema: IRSForm): AnalysisOutput {
  const analyzer = schema.analyzer ?? parseRSForm(schema);
  return analyzer.check(expression, {
    expected: typeClassForCstType(cst.cst_type),
    isDomain: cst.cst_type === CstType.STRUCTURED,
  });
}

export function parseRSForm(target: IRSForm): RSLangAnalyzer {
  const analyzer = new RSLangAnalyzer();
  target.analyzer = analyzer;
  const order = target.graph.topologicalOrder();
  order.forEach(cstID => {
    const cst = target.cstByID.get(cstID)!;
    parseCst(cst, analyzer);
  });
  return analyzer;
}

// ======= Internals ========
function parseCst(target: IConstituenta, analyzer: RSLangAnalyzer) {
  const cType = target.cst_type;
  if (cType === CstType.NOMINAL) {
    return;
  }
  if (cType === CstType.BASE) {
    analyzer.addBase(target.alias);
  } else if (cType === CstType.CONSTANT) {
    analyzer.addBase(target.alias, true);
  } else {
    const parse = analyzer.check(target.definition_formal, {
      expected: typeClassForCstType(cType),
      isDomain: cType === CstType.STRUCTURED
    });

    analyzer.setGlobal(target.alias, parse.type, parse.valueClass);
    if (target.parse?.status === ParsingStatus.VERIFIED !== parse.success) {
      throw new Error('Parsing status mismatch: ' + target.alias);
    }
    target.analysis = {
      success: parse.success,
      type: parse.type,
      ast: parse.ast,
      valueClass: parse.valueClass
    };
  }
}