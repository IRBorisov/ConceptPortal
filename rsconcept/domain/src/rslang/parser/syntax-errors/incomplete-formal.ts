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
import { isTextToken } from './error-builders';
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
    bodyNodes: (container, errorChild) => functionDeclBodyNodes(container, expression, errorChild),
    code: () => incompleteFormalExpressionCode(expected)
  });
}

function functionDeclBodyNodes(container: AstNode, expression: string, errorChild: AstNode): AstNode[] {
  const closeIndex = container.children.findIndex(child => isTextToken(child, expression, ']'));
  if (closeIndex < 0) {
    return [errorChild];
  }
  return container.children.slice(closeIndex + 1);
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
    bodyNodes: (container, errorChild) => quantifierBodyNodes(container, expression, errorChild),
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

function quantifierBodyNodes(container: AstNode, expression: string, errorChild: AstNode): AstNode[] {
  const inIndex = container.children.findIndex(child => isTextToken(child, expression, '∈'));
  if (inIndex < 0) {
    return [errorChild];
  }
  // Domain is the child after ∈; body starts after the domain.
  return container.children.slice(inIndex + 2);
}
