/**
 * Syntax error extraction — public entry point.
 *
 * Expects the **hybrid** AST produced by `normalizeAST` (see `parser/README.md`).
 * See {@link ./README.md} for pipeline, classifier order, and how to add codes.
 *
 * @module rslang/parser/syntax-errors
 */

import { type AstNode, visitAstDFS } from '../../../parsing';
import { annotateError } from '../../ast-annotations';
import { type ErrorReporter, type RSErrorDescription } from '../../error';
import { type TypeClass } from '../../semantic/typification';
import { TokenID } from '../token';

import { classifyFallbackError, classifyParseError } from './classify';
import { deduplicateErrors, extractBracketErrors, extractForbiddenCharacterErrors } from './expression-errors';
import { isIncompleteGeneratorBodyCode } from './generators';

/** When set, refines incomplete formal headers (`[α∈…]`, quantifiers). */
export interface SyntaxErrorOptions {
  expected?: TypeClass;
}

/**
 * Walks a parsed expression AST and reports syntax errors.
 *
 * @param ast - Root AST from `buildTree(parser.parse(expression))`
 * @param expression - Original source text (positions must match the AST)
 * @param reporter - Called once per deduplicated error
 * @param annotateErrors - When true, also calls `annotateError` on the triggering node
 * @param options - Optional typification hint for incomplete formal expressions
 */
export function extractSyntaxErrors(
  ast: AstNode,
  expression: string,
  reporter: ErrorReporter,
  annotateErrors: boolean = false,
  options?: SyntaxErrorOptions
) {
  const forbiddenErrors = extractForbiddenCharacterErrors(expression);
  if (forbiddenErrors.length > 0) {
    for (const error of forbiddenErrors) {
      reporter(error);
      if (annotateErrors) {
        annotateError(ast, error.code, error.params);
      }
    }
    return;
  }

  const collected: RSErrorDescription[] = [];
  const annotationTargets = new Map<RSErrorDescription, AstNode>();
  const collect = (error: RSErrorDescription, target?: AstNode) => {
    collected.push(error);
    if (target !== undefined) {
      annotationTargets.set(error, target);
    }
  };

  const bracketError = extractBracketErrors(expression);
  const hasBracketErrors = bracketError !== null;
  visitAstDFS(ast, node => extractInternal(node, expression, collect, hasBracketErrors, options));

  const hasIncompleteGenerator = collected.some(error => isIncompleteGeneratorBodyCode(error.code));
  if (bracketError !== null && !hasIncompleteGenerator) {
    collect(bracketError, ast);
  }

  for (const error of deduplicateErrors(collected)) {
    reporter(error);
    if (annotateErrors) {
      const target = annotationTargets.get(error);
      if (target !== undefined) {
        annotateError(target, error.code, error.params);
      }
    }
  }
}

function extractInternal(
  node: AstNode,
  expression: string,
  collect: (error: RSErrorDescription, target: AstNode) => void,
  hasBracketErrors: boolean,
  options?: SyntaxErrorOptions
) {
  if (node.typeID !== TokenID.ERROR) {
    return;
  }

  const classified = classifyParseError(node, expression, { hasBracketErrors, expected: options?.expected });
  if (classified !== null) {
    collect(classified, node);
    return;
  }

  const fallback = classifyFallbackError(node, hasBracketErrors);
  if (fallback !== null) {
    collect(fallback.error, fallback.target);
  }
}
