/**
 * AST navigation helpers and node-type predicates for classifiers.
 *
 * Predicates accept grammar terms **or** {@link TokenID} because `normalizeAST` runs before
 * error extraction and leaves `hasError` subtrees unnormalized — see `parser/README.md`.
 */

import type { AstNode } from '../../../parsing';
import { Filter, Function, Function_decl, Logic_quantor, Predicate } from '../parser.terms';
import { TokenID } from '../token';

export function findAncestor(node: AstNode, predicate: (node: AstNode) => boolean): AstNode | null {
  let current: AstNode | null = node;
  while (current !== null) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

export function findRelatedNode(node: AstNode, predicate: (target: AstNode) => boolean): AstNode | null {
  let current: AstNode | null = node.parent;
  while (current !== null) {
    for (const child of current.children) {
      if (predicate(child)) {
        return child;
      }
    }
    current = current.parent;
  }
  return null;
}

export function isDescendantOf(ancestor: AstNode, node: AstNode): boolean {
  let current: AstNode | null = node.parent;
  while (current !== null) {
    if (current === ancestor) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

export function subtreeHasError(node: AstNode): boolean {
  if (node.typeID === TokenID.ERROR) {
    return true;
  }
  return node.children.some(subtreeHasError);
}

export function isFunctionDeclNode(node: AstNode): boolean {
  return node.typeID === Function_decl || node.typeID === TokenID.NT_FUNC_DEFINITION;
}

export function isQuantifierNode(node: AstNode): boolean {
  return node.typeID === Logic_quantor;
}

export function isFunctionNode(node: AstNode): boolean {
  return node.typeID === Function || node.typeID === TokenID.ID_FUNCTION;
}

export function isPredicateNode(node: AstNode): boolean {
  return node.typeID === Predicate || node.typeID === TokenID.ID_PREDICATE;
}

export function isFilterNode(node: AstNode): boolean {
  return node.typeID === Filter || node.typeID === TokenID.FILTER;
}

export function findMatchingCloseBracket(expression: string, openPos: number): number {
  if (expression[openPos] !== '[') {
    return -1;
  }

  let depth = 0;
  for (let index = openPos; index < expression.length; index++) {
    const symbol = expression[index];
    if (symbol === '[') {
      depth++;
    } else if (symbol === ']') {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

export function getErrorOperandNode(node: AstNode): AstNode | null {
  if (node.typeID === TokenID.ERROR) {
    return node;
  }
  if (node.children.length === 1) {
    return getErrorOperandNode(node.children[0]);
  }
  return null;
}

export function isErrorPlaceholder(node: AstNode): boolean {
  if (node.typeID === TokenID.ERROR) {
    return true;
  }
  if (node.children.length === 0) {
    return false;
  }
  return node.children.every(child => isErrorPlaceholder(child));
}

/** True when a body slot is missing or is only an ERROR placeholder (not a real expression + trailing junk). */
export function isEmptyOrErrorOnlyBody(nodes: AstNode[]): boolean {
  if (nodes.length === 0) {
    return true;
  }
  if (nodes.length === 1) {
    return isErrorPlaceholder(nodes[0]);
  }
  return false;
}
