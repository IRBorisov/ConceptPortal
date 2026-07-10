/**
 * Reusable pattern: container header is valid, body slot is empty/ERROR-only, input ends here.
 *
 * Distinguishes a missing body (`[α∈X1]⚠`) from a real body with trailing junk
 * (`[α∈X1]1=1⚠)`), which must not report `expected*Body`.
 *
 * @see incomplete-formal.ts — function declarations, quantifiers
 */

import type { AstNode } from '../../../parsing';
import { type RSErrorCode, type RSErrorDescription } from '../../error';
import { TokenID } from '../token';

import { isEmptyOrErrorOnlyBody } from './ast-utils';
import { errorAt } from './error-builders';

export function detectTrailingErrorSlot(
  node: AstNode,
  expression: string,
  container: AstNode | null,
  options: {
    headerValid?: (container: AstNode) => boolean;
    /** Nodes that form the body after the header. Defaults to the trailing ERROR only. */
    bodyNodes?: (container: AstNode, errorChild: AstNode) => AstNode[];
    code: RSErrorCode | ((container: AstNode, bodyChild: AstNode) => RSErrorCode | null);
  }
): RSErrorDescription | null {
  if (container === null) {
    return null;
  }

  const bodyChild = container.children[container.children.length - 1];
  if (bodyChild?.typeID !== TokenID.ERROR || node !== bodyChild) {
    return null;
  }

  if (expression.slice(container.to).trim().length > 0) {
    return null;
  }

  if (options.headerValid !== undefined && !options.headerValid(container)) {
    return null;
  }

  const bodyNodes = options.bodyNodes?.(container, bodyChild) ?? [bodyChild];
  if (!isEmptyOrErrorOnlyBody(bodyNodes)) {
    return null;
  }

  const code = typeof options.code === 'function' ? options.code(container, bodyChild) : options.code;
  if (code === null) {
    return null;
  }

  return errorAt(bodyChild, code);
}
