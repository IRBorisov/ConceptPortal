/**
 * Formal expression helpers: normalization, templates, status.
 */

import { type AstNode } from '../../parsing';
import { ValueClass } from '../../rslang';
import { generateExpressionFromAst, parseRSLangExpression } from '../../rslang/api';
import { type ArgumentValue, CstStatus, CstType } from '../rsform';

import { isBasicConcept } from './cst-type';

/** Infers the status of an expression based on parsing and value information. */
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
export function inferTemplatedType(templateType: CstType, args: ArgumentValue[]): CstType {
  if (args.length === 0 || args.some(arg => !arg.value)) {
    return templateType;
  } else if (templateType === CstType.PREDICATE) {
    return CstType.AXIOM;
  } else {
    return CstType.TERM;
  }
}

/**
 * Normalize a RSLang expression for duplicate comparison.
 *
 * Returns `null` for basic concepts without formal definitions. Pass a pre-parsed `ast`
 * when the expression was already analyzed to avoid re-parsing.
 */
export function normalizeExpression(expression: string, cst_type: CstType, ast?: AstNode | null): string | null {
  if (isBasicConcept(cst_type) && cst_type !== CstType.AXIOM) {
    return null;
  }
  const parsed = ast ?? parseRSLangExpression(expression);
  let normalized = '';
  if (parsed && !parsed.hasError) {
    normalized = generateExpressionFromAst(parsed, { normalize: true });
  } else {
    normalized = expression;
  }
  normalized = normalized.replace(/\s+/g, '');
  return normalized === '' ? null : normalized;
}

/** Checks if given expression is a template. */
export function inferTemplate(expression: string): boolean {
  const match = expression.match(/R\d+/g);
  return (match && match?.length > 0) ?? false;
}

/** Apply filter based on start item type within an ordered list. */
export function applyFilterCategory<T extends { cst_type: CstType }>(start: T, items: readonly T[]): T[] {
  const startIndex = items.indexOf(start);
  if (startIndex === -1) {
    return [];
  }
  const nextCategoryIndex = items.findIndex((cst, index) => index > startIndex && cst.cst_type === CstType.STATEMENT);

  return items.filter((_, index) => index >= startIndex && (nextCategoryIndex === -1 || index < nextCategoryIndex));
}
