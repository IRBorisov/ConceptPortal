/**
 * Incomplete operators and bracket argument lists (`P1[S1, ]`).
 *
 * Tuple enums `(α,β,)` intentionally stay `unknownSyntax` — not `expectedArgument`.
 */

import type { AstNode } from '../../../parsing';
import { RSErrorCode, type RSErrorDescription } from '../../error';
import { Boolean, Expr_enum_min2, Logic_binary, Logic_predicates, Logic_unary, Setexpr_binary } from '../parser.terms';
import { TokenID } from '../token';

import {
  findAncestor,
  findMatchingCloseBracket,
  getErrorOperandNode,
  isFilterNode,
  isFunctionNode,
  isPredicateNode,
  subtreeHasError
} from './ast-utils';
import type { ErrorClassifier } from './context';
import { errorAt, hasOnlyClosingSuffix, isTextToken, sliceText } from './error-builders';

export const classifyIncompleteOperands: ErrorClassifier = (node, expression) =>
  detectIncompleteUnaryOperand(node, expression) ??
  detectIncompleteBinaryOperand(node, expression) ??
  detectIncompleteBooleanOperand(node, expression);

export const classifyIncompleteArgument: ErrorClassifier = (node, expression) =>
  detectIncompleteArgument(node, expression);

function detectIncompleteUnaryOperand(node: AstNode, expression: string): RSErrorDescription | null {
  const unaryNode = findAncestor(node, target => target.typeID === Logic_unary);
  if (unaryNode === null) {
    return null;
  }

  const operandChild = unaryNode.children[unaryNode.children.length - 1];
  if (operandChild?.typeID !== TokenID.ERROR || node !== operandChild) {
    return null;
  }

  if (expression.slice(unaryNode.to).trim().length > 0) {
    return null;
  }

  const operatorChild = unaryNode.children[0];
  if (operatorChild === undefined || operatorChild === operandChild) {
    return null;
  }

  if (!isTextToken(operatorChild, expression, '¬')) {
    return null;
  }

  return errorAt(operandChild, RSErrorCode.expectedUnaryOperand);
}

function detectIncompleteBinaryOperand(node: AstNode, expression: string): RSErrorDescription | null {
  const binaryNode = findAncestor(
    node,
    target => target.typeID === Logic_binary || target.typeID === Logic_predicates || target.typeID === Setexpr_binary
  );
  if (binaryNode === null) {
    return null;
  }

  const operandChild = binaryNode.children[binaryNode.children.length - 1];
  if (operandChild?.typeID !== TokenID.ERROR || node !== operandChild) {
    return null;
  }

  if (expression.slice(binaryNode.to).trim().length > 0) {
    return null;
  }

  if (binaryNode.children.length < 2) {
    return null;
  }

  const leftChild = binaryNode.children[0];
  if (leftChild.typeID === TokenID.ERROR || subtreeHasError(leftChild)) {
    return null;
  }

  return errorAt(operandChild, RSErrorCode.expectedRightOperand);
}

function detectIncompleteBooleanOperand(node: AstNode, expression: string): RSErrorDescription | null {
  const booleanNode = findAncestor(node, target => target.typeID === Boolean);
  if (booleanNode === null) {
    return null;
  }

  const operandChild = findTrailingErrorOperand(booleanNode, expression);
  if (operandChild === null || node !== operandChild) {
    return null;
  }

  if (!hasOnlyClosingSuffix(expression, booleanNode.to)) {
    return null;
  }

  return errorAt(operandChild, RSErrorCode.expectedRightOperand);
}

function detectIncompleteArgument(node: AstNode, expression: string): RSErrorDescription | null {
  const enumNode = findAncestor(node, target => target.typeID === Expr_enum_min2);
  if (enumNode === null || !isLegitimateArgumentEnum(enumNode, expression)) {
    return null;
  }

  const errorChild = findEnumArgumentError(enumNode, expression);
  if (errorChild === null || node !== errorChild || !hasOnlyClosingSuffix(expression, enumNode.to)) {
    return null;
  }

  return errorAt(errorChild, RSErrorCode.expectedArgument);
}

function findTrailingErrorOperand(container: AstNode, expression: string): AstNode | null {
  for (let index = container.children.length - 1; index >= 0; index--) {
    const child = container.children[index];
    if (isOperandStructuralToken(child, expression)) {
      continue;
    }
    return getErrorOperandNode(child);
  }
  return null;
}

function findEnumArgumentError(enumNode: AstNode, expression: string): AstNode | null {
  for (const child of enumNode.children) {
    if (isTextToken(child, expression, ',')) {
      continue;
    }
    const errorNode = getErrorOperandNode(child);
    if (errorNode !== null) {
      return errorNode;
    }
  }
  return null;
}

function isOperandStructuralToken(node: AstNode, expression: string): boolean {
  const text = sliceText(node, expression);
  return text === '(' || text === ')' || text === 'ℬ';
}

function isLegitimateArgumentEnum(enumNode: AstNode, expression: string): boolean {
  return findCallHostForBracketEnum(enumNode, expression) !== null;
}

function findCallHostForBracketEnum(enumNode: AstNode, expression: string): AstNode | null {
  let current: AstNode | null = enumNode.parent;
  while (current !== null) {
    for (const child of current.children) {
      if (!isFunctionNode(child) && !isPredicateNode(child) && !isFilterNode(child)) {
        continue;
      }
      if (isEnumInCallBrackets(enumNode, child, expression)) {
        return child;
      }
    }
    current = current.parent;
  }
  return null;
}

function isEnumInCallBrackets(enumNode: AstNode, nameNode: AstNode, expression: string): boolean {
  const rest = expression.slice(nameNode.to);
  const match = /^\s*\[/.exec(rest);
  if (match === null) {
    return false;
  }

  const openPos = nameNode.to + match.index + match[0].indexOf('[');
  const closePos = findMatchingCloseBracket(expression, openPos);
  if (closePos < 0) {
    return false;
  }

  return enumNode.from > openPos && enumNode.from < closePos;
}
