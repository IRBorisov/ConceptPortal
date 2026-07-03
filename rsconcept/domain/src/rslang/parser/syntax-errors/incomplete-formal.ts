/**
 * Incomplete formal headers: `[α∈…]` declarations and quantifiers (`∀α∈…`).
 */

import type { AstNode } from '../../../parsing';
import { RSErrorCode, type RSErrorDescription } from '../../error';
import { TypeClass as TypeClassEnum } from '../../semantic/typification';
import { Arguments, Variable_pack } from '../parser.terms';
import { TokenID } from '../token';

import { findAncestor, isFunctionDeclNode, isQuantifierNode, subtreeHasError } from './ast-utils';
import type { ClassifyContext, ErrorClassifier } from './context';
import { detectTrailingErrorSlot } from './trailing-slot';

export const classifyIncompleteFormal: ErrorClassifier = (node, expression, context) =>
  detectIncompleteFunctionDecl(node, expression, context.expected) ?? detectIncompleteQuantifier(node, expression);

function detectIncompleteFunctionDecl(
  node: AstNode,
  expression: string,
  expected?: ClassifyContext['expected']
): RSErrorDescription | null {
  return detectTrailingErrorSlot(node, expression, findAncestor(node, isFunctionDeclNode), {
    headerValid: container => {
      const argsNode = container.children.find(
        child => child.typeID === Arguments || child.typeID === TokenID.NT_ARGUMENTS
      );
      return argsNode !== undefined && !subtreeHasError(argsNode);
    },
    code: () => incompleteFormalExpressionCode(expected)
  });
}

function incompleteFormalExpressionCode(expected?: ClassifyContext['expected']): RSErrorCode {
  switch (expected) {
    case TypeClassEnum.function:
      return RSErrorCode.expectedExpressionBody;
    case TypeClassEnum.predicate:
    case TypeClassEnum.logic:
      return RSErrorCode.expectedLogicBody;
    default:
      return RSErrorCode.expectedFunctionBody;
  }
}

function detectIncompleteQuantifier(node: AstNode, expression: string): RSErrorDescription | null {
  return detectTrailingErrorSlot(node, expression, findAncestor(node, isQuantifierNode), {
    headerValid: container => {
      const varPack = container.children.find(
        child => child.typeID === Variable_pack || child.typeID === TokenID.NT_ENUM_DECL
      );
      return varPack !== undefined && !subtreeHasError(varPack);
    },
    code: (container, bodyChild) => {
      const inIndex = container.children.findIndex(child => expression.slice(child.from, child.to) === '∈');
      if (inIndex < 0) {
        return RSErrorCode.expectedQuantifierDomain;
      }

      const domainChild = container.children[inIndex + 1];
      if (domainChild === undefined || domainChild === bodyChild || subtreeHasError(domainChild)) {
        return RSErrorCode.expectedQuantifierDomain;
      }

      return RSErrorCode.expectedQuantifierBody;
    }
  });
}
