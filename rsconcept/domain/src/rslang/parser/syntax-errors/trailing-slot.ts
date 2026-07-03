/**
 * Reusable pattern: container header is valid, last child is `ERROR`, input ends here.
 *
 * @see incomplete-formal.ts — function declarations, quantifiers
 */

import type { AstNode } from '../../../parsing';
import { type RSErrorCode, type RSErrorDescription } from '../../error';
import { TokenID } from '../token';

import { errorAt } from './error-builders';

export function detectTrailingErrorSlot(
  node: AstNode,
  expression: string,
  container: AstNode | null,
  options: {
    headerValid?: (container: AstNode) => boolean;
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

  const code = typeof options.code === 'function' ? options.code(container, bodyChild) : options.code;
  if (code === null) {
    return null;
  }

  return errorAt(bodyChild, code);
}
