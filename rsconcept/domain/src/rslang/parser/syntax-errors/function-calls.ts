/**
 * Malformed calls: `Fi…(…)`, `F1` / `P1` without or with wrong argument brackets.
 */

import type { AstNode } from '../../../parsing';
import { RSErrorCode, type RSErrorDescription } from '../../error';

import {
  findAncestor,
  findMatchingCloseBracket,
  findRelatedNode,
  isFilterNode,
  isFunctionNode,
  isPredicateNode
} from './ast-utils';
import type { ErrorClassifier } from './context';

export const classifyFilterParenMismatch: ErrorClassifier = (node, expression) => {
  const filterNode = findAncestor(node, isFilterNode) ?? findRelatedNode(node, isFilterNode);
  if (filterNode === null || expression[filterNode.to] !== '(') {
    return null;
  }

  return {
    code: RSErrorCode.invalidFilterSyntax,
    from: filterNode.from,
    to: filterNode.to + 1
  };
};

export const classifyGlobalFuncCall: ErrorClassifier = (node, expression) => {
  const funcNode =
    findAncestor(node, n => isFunctionNode(n) || isPredicateNode(n)) ??
    findRelatedNode(node, n => isFunctionNode(n) || isPredicateNode(n));
  if (funcNode === null) {
    return null;
  }
  return classifyFuncWithoutArgs(funcNode, expression);
};

function classifyFuncWithoutArgs(funcNode: AstNode, expression: string): RSErrorDescription | null {
  const name = expression.slice(funcNode.from, funcNode.to);
  const rest = expression.slice(funcNode.to);

  const withoutArgs: RSErrorDescription = {
    code: RSErrorCode.globalFuncWithoutArgs,
    from: funcNode.from,
    to: funcNode.to,
    params: [name]
  };

  if (/^\s*$/.test(rest)) {
    return withoutArgs;
  }

  if (/^\s*\(/.test(rest)) {
    return {
      code: RSErrorCode.globalFuncParenCall,
      from: funcNode.from,
      to: funcNode.to,
      params: [name]
    };
  }

  const openBracket = /^\s*\[/.exec(rest);
  if (openBracket === null) {
    return null;
  }

  const closeIdx = findMatchingCloseBracket(rest, openBracket[0].length - 1);
  if (closeIdx >= 0 && rest.slice(openBracket[0].length, closeIdx).trim().length === 0) {
    return withoutArgs;
  }

  return null;
}
