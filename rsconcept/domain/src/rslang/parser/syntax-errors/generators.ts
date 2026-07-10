/**
 * Incomplete generator bodies: declarative `D{…}`, imperative `I{…}`, recursive `R{…}`.
 */

import type { AstNode } from '../../../parsing';
import { RSErrorCode, type RSErrorDescription } from '../../error';
import { Declarative, Imp_blocks, Imperative, Recursion, Setexpr } from '../parser.terms';
import { TokenID } from '../token';

import { findAncestor, isDescendantOf, isEmptyOrErrorOnlyBody, isErrorPlaceholder, subtreeHasError } from './ast-utils';
import type { ErrorClassifier } from './context';
import { errorAt, isTextToken } from './error-builders';

export const classifyIncompleteGenerator: ErrorClassifier = (node, expression) =>
  detectIncompleteDeclarative(node, expression) ??
  detectIncompleteImperative(node, expression) ??
  detectIncompleteRecursion(node, expression);

export function isIncompleteGeneratorBodyCode(code: RSErrorCode): boolean {
  return (
    code === RSErrorCode.expectedDeclarativeBody ||
    code === RSErrorCode.expectedImperativeBody ||
    code === RSErrorCode.expectedRecursiveBody
  );
}

interface GeneratorBodySlot {
  nodes: AstNode[];
  headerEndIndex: number;
}

function detectIncompleteDeclarative(node: AstNode, expression: string): RSErrorDescription | null {
  const generatorNode = findAncestor(
    node,
    target => target.typeID === Declarative || target.typeID === TokenID.NT_DECLARATIVE_EXPR
  );
  return detectIncompleteGeneratorBody(node, expression, generatorNode, RSErrorCode.expectedDeclarativeBody, slot =>
    isIncompleteDeclarativeBody(slot.nodes)
  );
}

function detectIncompleteImperative(node: AstNode, expression: string): RSErrorDescription | null {
  const generatorNode = findAncestor(
    node,
    target => target.typeID === Imperative || target.typeID === TokenID.NT_IMPERATIVE_EXPR
  );
  return detectIncompleteGeneratorBody(node, expression, generatorNode, RSErrorCode.expectedImperativeBody, slot =>
    isIncompleteImperativeBody(slot, expression)
  );
}

function detectIncompleteRecursion(node: AstNode, expression: string): RSErrorDescription | null {
  const generatorNode = findAncestor(node, target => target.typeID === Recursion);
  return detectIncompleteGeneratorBody(node, expression, generatorNode, RSErrorCode.expectedRecursiveBody, slot =>
    isIncompleteRecursionBody(slot.nodes)
  );
}

function detectIncompleteGeneratorBody(
  node: AstNode,
  expression: string,
  generatorNode: AstNode | null,
  code: RSErrorCode,
  isIncomplete: (slot: GeneratorBodySlot) => boolean
): RSErrorDescription | null {
  if (generatorNode === null || expression.slice(generatorNode.to).trim().length > 0) {
    return null;
  }

  const slot = getGeneratorBodySlot(generatorNode, expression);
  if (slot === null || !isIncomplete(slot) || !generatorHeaderIsValid(generatorNode, expression, slot.headerEndIndex)) {
    return null;
  }

  if (!isErrorInBodySlot(node, slot, generatorNode)) {
    return null;
  }

  return errorAt(node, code);
}

function getGeneratorBodySlot(generatorNode: AstNode, expression: string): GeneratorBodySlot | null {
  if (generatorNode.typeID === Declarative || generatorNode.typeID === TokenID.NT_DECLARATIVE_EXPR) {
    return getDeclarativeBodySlot(generatorNode, expression);
  }
  if (generatorNode.typeID === Imperative || generatorNode.typeID === TokenID.NT_IMPERATIVE_EXPR) {
    return getImperativeBodySlot(generatorNode, expression);
  }
  if (generatorNode.typeID === Recursion) {
    return getRecursionBodySlot(generatorNode, expression);
  }
  return null;
}

function getDeclarativeBodySlot(declNode: AstNode, expression: string): GeneratorBodySlot | null {
  const pipeIndex = declNode.children.findIndex(child => isTextToken(child, expression, '|'));
  if (pipeIndex >= 0) {
    return {
      nodes: contentChildren(declNode, expression, pipeIndex + 1),
      headerEndIndex: pipeIndex + 1
    };
  }

  const domainNode = findDeclarativeDomain(declNode, expression);
  if (domainNode === null) {
    return null;
  }

  const domainIndex = declNode.children.indexOf(domainNode);
  return {
    nodes: contentChildren(declNode, expression, domainIndex + 1),
    headerEndIndex: domainIndex + 1
  };
}

function getImperativeBodySlot(impNode: AstNode, expression: string): GeneratorBodySlot | null {
  const pipeIndex = impNode.children.findIndex(child => isTextToken(child, expression, '|'));
  if (pipeIndex >= 0) {
    return {
      nodes: contentChildren(impNode, expression, pipeIndex + 1),
      headerEndIndex: pipeIndex + 1
    };
  }

  const tupleNode = findImperativeTuple(impNode);
  if (tupleNode === null) {
    return null;
  }

  const tupleIndex = impNode.children.indexOf(tupleNode);
  return {
    nodes: contentChildren(impNode, expression, tupleIndex + 1),
    headerEndIndex: tupleIndex + 1
  };
}

function getRecursionBodySlot(recNode: AstNode, expression: string): GeneratorBodySlot | null {
  const initNode = findRecursionInit(recNode, expression);
  if (initNode === null) {
    return null;
  }

  const initIndex = recNode.children.indexOf(initNode);
  const afterInit = contentChildren(recNode, expression, initIndex + 1);
  const lastPipeIndex = findLastPipeIndex(afterInit, expression);
  if (lastPipeIndex < 0) {
    return {
      nodes: afterInit,
      headerEndIndex: initIndex + 1
    };
  }

  return {
    nodes: afterInit.slice(lastPipeIndex + 1),
    headerEndIndex: recNode.children.indexOf(afterInit[lastPipeIndex]) + 1
  };
}

function contentChildren(generatorNode: AstNode, expression: string, fromIndex: number): AstNode[] {
  return generatorNode.children.slice(fromIndex).filter(child => !isClosingBrace(child, expression));
}

function findDeclarativeDomain(declNode: AstNode, expression: string): AstNode | null {
  const inIndex = declNode.children.findIndex(child => isTextToken(child, expression, '∈'));
  if (inIndex < 0) {
    return null;
  }

  for (let index = inIndex + 1; index < declNode.children.length; index++) {
    const child = declNode.children[index];
    if (isTextToken(child, expression, '|') || isClosingBrace(child, expression)) {
      break;
    }
    if (child.typeID === Setexpr) {
      return child;
    }
  }

  return null;
}

function findImperativeTuple(impNode: AstNode): AstNode | null {
  for (const child of impNode.children) {
    if (child.typeID === Setexpr) {
      return child;
    }
  }
  return null;
}

function findLastPipeIndex(nodes: AstNode[], expression: string): number {
  for (let index = nodes.length - 1; index >= 0; index--) {
    if (isTextToken(nodes[index], expression, '|')) {
      return index;
    }
  }
  return -1;
}

function generatorHeaderIsValid(generatorNode: AstNode, expression: string, headerEndIndex: number): boolean {
  for (let index = 0; index < headerEndIndex; index++) {
    const child = generatorNode.children[index];
    if (child.typeID === TokenID.ERROR) {
      return false;
    }
    if (isStructuralGeneratorToken(child, expression)) {
      continue;
    }
    if (subtreeHasError(child)) {
      return false;
    }
  }
  return true;
}

function isIncompleteDeclarativeBody(nodes: AstNode[]): boolean {
  return isEmptyOrErrorOnlyBody(nodes);
}

function isIncompleteImperativeBody(slot: GeneratorBodySlot, expression: string): boolean {
  if (slot.nodes.length === 0) {
    return true;
  }
  if (slot.nodes.length === 1 && slot.nodes[0].typeID === Imp_blocks) {
    return isImpBlocksIncomplete(slot.nodes[0], expression);
  }
  return isEmptyOrErrorOnlyBody(slot.nodes);
}

function isIncompleteRecursionBody(nodes: AstNode[]): boolean {
  return isEmptyOrErrorOnlyBody(nodes);
}

function isImpBlocksIncomplete(blocksNode: AstNode, expression: string): boolean {
  if (blocksNode.children.length === 0) {
    return true;
  }

  const lastChild = blocksNode.children[blocksNode.children.length - 1];
  if (lastChild.typeID === TokenID.ERROR) {
    return true;
  }
  if (isTextToken(lastChild, expression, ';')) {
    return true;
  }
  if (lastChild.typeID === Setexpr && isErrorPlaceholder(lastChild)) {
    return true;
  }

  return false;
}

function isErrorInBodySlot(errorNode: AstNode, slot: GeneratorBodySlot, generatorNode: AstNode): boolean {
  if (slot.nodes.length === 0) {
    const bodyStart = generatorNode.children[slot.headerEndIndex]?.from ?? generatorNode.from;
    return errorNode.from >= bodyStart;
  }

  for (const bodyNode of slot.nodes) {
    if (errorNode === bodyNode || isDescendantOf(bodyNode, errorNode)) {
      if (isErrorPlaceholder(bodyNode)) {
        return true;
      }
      if (bodyNode.typeID === Imp_blocks && isImpBlocksTailError(bodyNode, errorNode)) {
        return true;
      }
    }
  }

  return false;
}

function isImpBlocksTailError(blocksNode: AstNode, errorNode: AstNode): boolean {
  const lastChild = blocksNode.children[blocksNode.children.length - 1];
  return lastChild.typeID === TokenID.ERROR && (errorNode === lastChild || isDescendantOf(lastChild, errorNode));
}

function findRecursionInit(recursionNode: AstNode, expression: string): AstNode | null {
  const assignIndex = recursionNode.children.findIndex(child => isTextToken(child, expression, ':='));
  if (assignIndex < 0) {
    return null;
  }

  for (let index = assignIndex + 1; index < recursionNode.children.length; index++) {
    const child = recursionNode.children[index];
    if (child.typeID === TokenID.ERROR) {
      break;
    }
    if (isTextToken(child, expression, '|') || isClosingBrace(child, expression)) {
      continue;
    }
    return child;
  }

  return null;
}

function isClosingBrace(node: AstNode, expression: string): boolean {
  return node.typeID !== TokenID.ERROR && isTextToken(node, expression, '}');
}

function isStructuralGeneratorToken(node: AstNode, expression: string): boolean {
  const text = expression.slice(node.from, node.to);
  return text === '{' || text === '}' || text === '|' || text === '∈' || text === ':=' || text === ';';
}
