/**
 * Parse-error classification: ordered classifier chain and P8400 fallback.
 *
 * Register new detectors in `PARSE_ERROR_CLASSIFIERS` (first match wins).
 */

import type { AstNode } from '../../../parsing';
import { RSErrorCode, type RSErrorDescription } from '../../error';
import { Variable } from '../parser.terms';

import type { ClassifyContext, ErrorClassifier } from './context';
import { whenNoBracketErrors } from './context';
import { classifyFilterParenMismatch, classifyGlobalFuncCall } from './function-calls';
import { classifyIncompleteGenerator } from './generators';
import { classifyIncompleteFormal } from './incomplete-formal';
import { classifyIncompleteArgument, classifyIncompleteOperands } from './incomplete-operands';

const PARSE_ERROR_CLASSIFIERS: ErrorClassifier[] = [
  classifyIncompleteFormal,
  classifyIncompleteGenerator,
  whenNoBracketErrors(classifyIncompleteOperands),
  whenNoBracketErrors(classifyIncompleteArgument),
  classifyFilterParenMismatch,
  classifyGlobalFuncCall
];

/** Runs classifiers in priority order for one `ERROR` AST node. */
export function classifyParseError(
  node: AstNode,
  expression: string,
  context: ClassifyContext
): RSErrorDescription | null {
  for (const classifier of PARSE_ERROR_CLASSIFIERS) {
    const error = classifier(node, expression, context);
    if (error !== null) {
      return error;
    }
  }
  return null;
}

/** Default rules when no classifier matched: `expectedLocal` or `unknownSyntax`. */
export function classifyFallbackError(
  node: AstNode,
  ignoreUnknownErrors: boolean
): { error: RSErrorDescription; target: AstNode } | null {
  const parent = node.parent;
  if (parent === null) {
    return ignoreUnknownErrors
      ? null
      : { error: { code: RSErrorCode.unknownSyntax, from: node.from, to: node.to }, target: node };
  }

  if (parent.typeID === Variable) {
    return {
      error: { code: RSErrorCode.expectedLocal, from: parent.from, to: parent.to },
      target: parent
    };
  }

  if (ignoreUnknownErrors) {
    return null;
  }

  const target = node.from === node.to ? parent : node;
  return {
    error: { code: RSErrorCode.unknownSyntax, from: target.from, to: target.to },
    target
  };
}
