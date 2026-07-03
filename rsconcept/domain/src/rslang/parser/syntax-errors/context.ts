/**
 * Types for the parse-error classifier pipeline.
 */

import type { AstNode } from '../../../parsing';
import type { RSErrorDescription } from '../../error';
import type { TypeClass } from '../../semantic/typification';

/** Shared state passed through parse-error classifiers. */
export interface ClassifyContext {
  hasBracketErrors: boolean;
  expected?: TypeClass;
}

/** Classifies a single ERROR node into a specific syntax error, if possible. */
export type ErrorClassifier = (
  node: AstNode,
  expression: string,
  context: ClassifyContext
) => RSErrorDescription | null;

/** Skips classifiers that conflict with bracket-level diagnostics. */
export function whenNoBracketErrors(classifier: ErrorClassifier): ErrorClassifier {
  return (node, expression, context) => (context.hasBracketErrors ? null : classifier(node, expression, context));
}
