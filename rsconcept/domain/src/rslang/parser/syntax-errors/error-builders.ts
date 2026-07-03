/**
 * Small helpers for building `RSErrorDescription` values from AST nodes.
 */

import type { AstNode } from '../../../parsing';
import { type RSErrorCode, type RSErrorDescription } from '../../error';

export function errorAt(node: AstNode, code: RSErrorCode, params?: readonly string[]): RSErrorDescription {
  return {
    code,
    from: node.from,
    to: node.to,
    params
  };
}

export function hasOnlyClosingSuffix(expression: string, from: number): boolean {
  const suffix = expression.slice(from).trim();
  return suffix.length === 0 || /^[\]\)\}]*$/.test(suffix);
}

export function sliceText(node: AstNode, expression: string): string {
  return expression.slice(node.from, node.to);
}

export function isTextToken(node: AstNode, expression: string, text: string): boolean {
  return sliceText(node, expression) === text;
}
