/**
 * Module: Syntactic errors reporting.
 */

import { type AstNode, visitAstDFS } from '../../parsing';
import { annotateError } from '../ast-annotations';
import { type ErrorReporter, RSErrorCode, type RSErrorDescription } from '../error';
import { type TypeClass, TypeClass as TypeClassEnum } from '../semantic/typification';

import {
  Arguments,
  Declarative,
  Filter,
  Function,
  Function_decl,
  Imp_blocks,
  Imperative,
  Logic_quantor,
  Predicate,
  Recursion,
  Setexpr,
  Variable,
  Variable_pack
} from './parser.terms';
import { TokenID } from './token';

/** Options for syntax error extraction. */
export interface SyntaxErrorOptions {
  expected?: TypeClass;
}

/** Extracts syntax errors from an AST. */
export function extractSyntaxErrors(
  ast: AstNode,
  expression: string,
  reporter: ErrorReporter,
  annotateErrors: boolean = false,
  options?: SyntaxErrorOptions
) {
  const forbiddenErrors = extractForbiddenCharacterErrors(expression);
  if (forbiddenErrors.length > 0) {
    for (const error of forbiddenErrors) {
      reporter(error);
      if (annotateErrors) {
        annotateError(ast, error.code, error.params);
      }
    }
    return;
  }

  const collected: RSErrorDescription[] = [];
  const annotationTargets = new Map<RSErrorDescription, AstNode>();
  const collect = (error: RSErrorDescription, target?: AstNode) => {
    collected.push(error);
    if (target !== undefined) {
      annotationTargets.set(error, target);
    }
  };

  const bracketError = extractBracketErrors(expression);
  const hasBracketErrors = bracketError !== null;
  visitAstDFS(ast, node => extractInternal(node, expression, collect, hasBracketErrors, options));

  const hasIncompleteGenerator = collected.some(error => isIncompleteGeneratorBodyCode(error.code));
  if (bracketError !== null && !hasIncompleteGenerator) {
    collect(bracketError, ast);
  }

  for (const error of deduplicateErrors(collected)) {
    reporter(error);
    if (annotateErrors) {
      const target = annotationTargets.get(error);
      if (target !== undefined) {
        annotateError(target, error.code, error.params);
      }
    }
  }
}

// ====== Internals =========
function extractInternal(
  node: AstNode,
  expression: string,
  collect: (error: RSErrorDescription, target: AstNode) => void,
  ignoreUnknownErrors: boolean,
  options?: SyntaxErrorOptions
) {
  if (node.typeID !== TokenID.ERROR) {
    return;
  }

  function emit(target: AstNode, code: RSErrorCode, params?: readonly string[]) {
    collect({ code: code, from: target.from, to: target.to, params }, target);
  }

  const classified = classifyParseError(node, expression, options);
  if (classified !== null) {
    collect(classified, node);
    return;
  }

  const parent = node.parent;
  if (parent === null) {
    if (!ignoreUnknownErrors) {
      return emit(node, RSErrorCode.unknownSyntax);
    }
    return;
  }

  if (parent.typeID === Variable) {
    return emit(parent, RSErrorCode.expectedLocal);
  }

  if (!ignoreUnknownErrors) {
    emit(node.from === node.to ? parent : node, RSErrorCode.unknownSyntax);
  }
}

function classifyParseError(
  node: AstNode,
  expression: string,
  options?: SyntaxErrorOptions
): RSErrorDescription | null {
  const incompleteFunctionDecl = detectIncompleteFunctionDecl(node, expression, options?.expected);
  if (incompleteFunctionDecl !== null) {
    return incompleteFunctionDecl;
  }

  const incompleteQuantifier = detectIncompleteQuantifier(node, expression);
  if (incompleteQuantifier !== null) {
    return incompleteQuantifier;
  }

  const incompleteGenerator = detectIncompleteGenerator(node, expression);
  if (incompleteGenerator !== null) {
    return incompleteGenerator;
  }

  const filterParen = detectFilterParenMismatch(node, expression);
  if (filterParen !== null) {
    return filterParen;
  }

  return detectGlobalFuncWithoutArgs(node, expression);
}

function detectIncompleteFunctionDecl(
  node: AstNode,
  expression: string,
  expected?: TypeClass
): RSErrorDescription | null {
  const funcDecl = findAncestor(node, isFunctionDeclNode);
  if (funcDecl === null) {
    return null;
  }

  const bodyChild = funcDecl.children[funcDecl.children.length - 1];
  if (bodyChild?.typeID !== TokenID.ERROR || node !== bodyChild) {
    return null;
  }

  const argsNode = funcDecl.children.find(child => child.typeID === Arguments || child.typeID === TokenID.NT_ARGUMENTS);
  if (argsNode === undefined || subtreeHasError(argsNode)) {
    return null;
  }

  if (expression.slice(funcDecl.to).trim().length > 0) {
    return null;
  }

  return {
    code: incompleteFormalExpressionCode(expected),
    from: bodyChild.from,
    to: bodyChild.to
  };
}

function incompleteFormalExpressionCode(expected?: TypeClass): RSErrorCode {
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
  const quantNode = findAncestor(node, isQuantifierNode);
  if (quantNode === null) {
    return null;
  }

  const bodyChild = quantNode.children[quantNode.children.length - 1];
  if (bodyChild?.typeID !== TokenID.ERROR || node !== bodyChild) {
    return null;
  }

  const headerChildren = quantNode.children.slice(0, -1);
  if (headerChildren.length < 3) {
    return null;
  }

  const varPack = headerChildren.find(child => child.typeID === Variable_pack || child.typeID === TokenID.NT_ENUM_DECL);
  if (varPack === undefined || subtreeHasError(varPack)) {
    return null;
  }

  const domainChild = headerChildren[headerChildren.length - 1];
  if (domainChild === varPack || subtreeHasError(domainChild)) {
    return null;
  }

  if (expression.slice(quantNode.to).trim().length > 0) {
    return null;
  }

  return {
    code: RSErrorCode.expectedQuantifierBody,
    from: bodyChild.from,
    to: bodyChild.to
  };
}

function detectIncompleteGenerator(node: AstNode, expression: string): RSErrorDescription | null {
  return (
    detectIncompleteDeclarative(node, expression) ??
    detectIncompleteImperative(node, expression) ??
    detectIncompleteRecursion(node, expression)
  );
}

function detectIncompleteDeclarative(node: AstNode, expression: string): RSErrorDescription | null {
  const generatorNode = findAncestor(
    node,
    target => target.typeID === Declarative || target.typeID === TokenID.NT_DECLARATIVE_EXPR
  );
  return detectIncompleteGeneratorBody(node, expression, generatorNode, RSErrorCode.expectedDeclarativeBody, slot =>
    isIncompleteDeclarativeBody(slot)
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
    isIncompleteRecursionBody(slot)
  );
}

interface GeneratorBodySlot {
  nodes: AstNode[];
  headerEndIndex: number;
}

function detectIncompleteGeneratorBody(
  node: AstNode,
  expression: string,
  generatorNode: AstNode | null,
  code: RSErrorCode,
  isIncomplete: (slot: GeneratorBodySlot) => boolean
): RSErrorDescription | null {
  if (generatorNode === null) {
    return null;
  }

  if (expression.slice(generatorNode.to).trim().length > 0) {
    return null;
  }

  const slot = getGeneratorBodySlot(generatorNode, expression);
  if (slot === null || !isIncomplete(slot)) {
    return null;
  }

  if (!generatorHeaderIsValid(generatorNode, expression, slot.headerEndIndex)) {
    return null;
  }

  if (!isErrorInBodySlot(node, slot, generatorNode)) {
    return null;
  }

  return incompleteGeneratorError(code, node);
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
  const pipeIndex = declNode.children.findIndex(child => isPipeToken(child, expression));
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
  const pipeIndex = impNode.children.findIndex(child => isPipeToken(child, expression));
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
  const inIndex = declNode.children.findIndex(child => expression.slice(child.from, child.to) === '∈');
  if (inIndex < 0) {
    return null;
  }

  for (let index = inIndex + 1; index < declNode.children.length; index++) {
    const child = declNode.children[index];
    if (isPipeToken(child, expression) || isClosingBrace(child, expression)) {
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
    if (isPipeToken(nodes[index], expression)) {
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

function isIncompleteDeclarativeBody(slot: GeneratorBodySlot): boolean {
  return isEmptyOrErrorOnlyBody(slot.nodes);
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

function isIncompleteRecursionBody(slot: GeneratorBodySlot): boolean {
  return isEmptyOrErrorOnlyBody(slot.nodes);
}

function isEmptyOrErrorOnlyBody(nodes: AstNode[]): boolean {
  if (nodes.length === 0) {
    return true;
  }
  if (nodes.length === 1) {
    return isErrorPlaceholder(nodes[0]);
  }
  return false;
}

function isImpBlocksIncomplete(blocksNode: AstNode, expression: string): boolean {
  if (blocksNode.children.length === 0) {
    return true;
  }

  const lastChild = blocksNode.children[blocksNode.children.length - 1];
  if (lastChild.typeID === TokenID.ERROR) {
    return true;
  }
  if (isSemicolonToken(lastChild, expression)) {
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

function isErrorPlaceholder(node: AstNode): boolean {
  if (node.typeID === TokenID.ERROR) {
    return true;
  }
  if (node.children.length === 0) {
    return false;
  }
  return node.children.every(child => isErrorPlaceholder(child));
}

function isDescendantOf(ancestor: AstNode, node: AstNode): boolean {
  let current: AstNode | null = node.parent;
  while (current !== null) {
    if (current === ancestor) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function findRecursionInit(recursionNode: AstNode, expression: string): AstNode | null {
  const assignIndex = recursionNode.children.findIndex(child => expression.slice(child.from, child.to) === ':=');
  if (assignIndex < 0) {
    return null;
  }

  for (let index = assignIndex + 1; index < recursionNode.children.length; index++) {
    const child = recursionNode.children[index];
    if (child.typeID === TokenID.ERROR) {
      break;
    }
    if (isPipeToken(child, expression) || isClosingBrace(child, expression)) {
      continue;
    }
    return child;
  }

  return null;
}

function incompleteGeneratorError(code: RSErrorCode, errorNode: AstNode): RSErrorDescription {
  return {
    code,
    from: errorNode.from,
    to: errorNode.to
  };
}

function isIncompleteGeneratorBodyCode(code: RSErrorCode): boolean {
  return (
    code === RSErrorCode.expectedDeclarativeBody ||
    code === RSErrorCode.expectedImperativeBody ||
    code === RSErrorCode.expectedRecursiveBody
  );
}

function isPipeToken(node: AstNode, expression: string): boolean {
  return expression.slice(node.from, node.to) === '|';
}

function isSemicolonToken(node: AstNode, expression: string): boolean {
  return expression.slice(node.from, node.to) === ';';
}

function isClosingBrace(node: AstNode, expression: string): boolean {
  return node.typeID !== TokenID.ERROR && expression.slice(node.from, node.to) === '}';
}

function isStructuralGeneratorToken(node: AstNode, expression: string): boolean {
  const text = expression.slice(node.from, node.to);
  return text === '{' || text === '}' || text === '|' || text === '∈' || text === ':=' || text === ';';
}

function subtreeHasError(node: AstNode): boolean {
  if (node.typeID === TokenID.ERROR) {
    return true;
  }
  return node.children.some(subtreeHasError);
}

function detectFilterParenMismatch(node: AstNode, expression: string): RSErrorDescription | null {
  const filterNode = findAncestor(node, isFilterNode) ?? findRelatedNode(node, isFilterNode);
  if (filterNode === null) {
    return null;
  }

  const nextChar = expression[filterNode.to];
  if (nextChar === '(') {
    return {
      code: RSErrorCode.invalidFilterSyntax,
      from: filterNode.from,
      to: filterNode.to + 1
    };
  }
  return null;
}

function detectGlobalFuncWithoutArgs(node: AstNode, expression: string): RSErrorDescription | null {
  const funcNode =
    findAncestor(node, n => isFunctionNode(n) || isPredicateNode(n)) ??
    findRelatedNode(node, n => isFunctionNode(n) || isPredicateNode(n));
  if (funcNode === null) {
    return null;
  }
  return classifyFuncWithoutArgs(funcNode, expression);
}

function findRelatedNode(node: AstNode, predicate: (target: AstNode) => boolean): AstNode | null {
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

function classifyFuncWithoutArgs(funcNode: AstNode, expression: string): RSErrorDescription | null {
  const name = expression.slice(funcNode.from, funcNode.to);
  const rest = expression.slice(funcNode.to);

  const withoutArgs: RSErrorDescription = {
    code: RSErrorCode.globalFuncWithoutArgs,
    from: funcNode.from,
    to: funcNode.to,
    params: [name]
  };

  // Function with nothing (or only whitespace) after it is genuinely called without arguments.
  if (/^\s*$/.test(rest)) {
    return withoutArgs;
  }

  // Anything other than a bracketed argument form (e.g. parentheses or braces) is malformed call
  // syntax: defer to the bracket/syntax error handling instead of reporting a missing-arguments error.
  const openBracket = /^\s*\[/.exec(rest);
  if (openBracket === null) {
    return null;
  }

  const closeIdx = findMatchingCloseBracket(rest, openBracket[0].length - 1);
  if (closeIdx >= 0) {
    const inner = rest.slice(openBracket[0].length, closeIdx).trim();
    if (inner.length === 0) {
      return withoutArgs;
    }
  }

  return null;
}

function findAncestor(node: AstNode, predicate: (node: AstNode) => boolean): AstNode | null {
  let current: AstNode | null = node;
  while (current !== null) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function isFunctionDeclNode(node: AstNode): boolean {
  return node.typeID === Function_decl || node.typeID === TokenID.NT_FUNC_DEFINITION;
}

function isQuantifierNode(node: AstNode): boolean {
  return node.typeID === Logic_quantor;
}

function isFunctionNode(node: AstNode): boolean {
  return node.typeID === Function || node.typeID === TokenID.ID_FUNCTION;
}

function isPredicateNode(node: AstNode): boolean {
  return node.typeID === Predicate || node.typeID === TokenID.ID_PREDICATE;
}

function isFilterNode(node: AstNode): boolean {
  return node.typeID === Filter || node.typeID === TokenID.FILTER;
}

function findMatchingCloseBracket(expression: string, openPos: number): number {
  const open = expression[openPos];
  if (open !== '[') {
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

function deduplicateErrors(errors: RSErrorDescription[]): RSErrorDescription[] {
  const result: RSErrorDescription[] = [];

  for (const error of errors) {
    const duplicate = result.some(
      existing => existing.code === error.code && existing.from === error.from && existing.to === error.to
    );
    if (duplicate) {
      continue;
    }

    if (error.code !== RSErrorCode.unknownSyntax) {
      for (let index = result.length - 1; index >= 0; index--) {
        if (result[index].code === RSErrorCode.unknownSyntax && rangesOverlap(error, result[index])) {
          result.splice(index, 1);
        }
      }
    }

    result.push(error);
  }

  const specific = result.filter(error => error.code !== RSErrorCode.unknownSyntax);
  return result.filter(
    error => error.code !== RSErrorCode.unknownSyntax || !specific.some(item => rangesOverlap(error, item))
  );
}

function rangesOverlap(a: RSErrorDescription, b: RSErrorDescription): boolean {
  return a.from < b.to && b.from < a.to;
}

type OpenBracket = '(' | '[' | '{';
type CloseBracket = ')' | ']' | '}';

interface BracketFrame {
  bracket: OpenBracket;
  index: number;
}

const ALLOWED_EXPRESSION_CHARS = buildAllowedExpressionChars();

function buildAllowedExpressionChars(): Set<string> {
  const chars = new Set<string>();
  for (const chunk of [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '_',
    '∅¬∀∃⇔⇒∨&ℬ+-*∪\\∆∩×∈∉⊆⊄⊂<>≥≤≠=,:;|[]{}()'
  ]) {
    for (const symbol of chunk) {
      chars.add(symbol);
    }
  }
  for (let codePoint = 0x03b1; codePoint <= 0x03c9; codePoint++) {
    chars.add(String.fromCodePoint(codePoint));
  }
  return chars;
}

function isAllowedExpressionChar(symbol: string): boolean {
  return /\s/u.test(symbol) || ALLOWED_EXPRESSION_CHARS.has(symbol);
}

function extractForbiddenCharacterErrors(expression: string): RSErrorDescription[] {
  const errors: RSErrorDescription[] = [];
  let pos = 0;

  while (pos < expression.length) {
    const symbol = expression[pos];
    if (isAllowedExpressionChar(symbol)) {
      pos++;
      continue;
    }

    const start = pos;
    while (pos < expression.length && !isAllowedExpressionChar(expression[pos])) {
      pos++;
    }

    errors.push({
      code: RSErrorCode.forbiddenCharacter,
      from: start,
      to: pos,
      params: [expression.slice(start, pos)]
    });
  }

  return errors;
}

function extractBracketErrors(expression: string): RSErrorDescription | null {
  const stack: BracketFrame[] = [];

  for (let pos = 0; pos < expression.length; pos++) {
    const symbol = expression[pos];
    if (isOpenBracket(symbol)) {
      if (isDoubleParenthesis(expression, pos)) {
        return {
          code: RSErrorCode.doubleParenthesis,
          from: pos,
          to: pos + 2
        };
      }
      stack.push({ bracket: symbol, index: pos });
      continue;
    }
    if (!isCloseBracket(symbol)) {
      continue;
    }

    const expectedOpen = closeToOpen(symbol);
    const top = stack[stack.length - 1];
    if (top === undefined) {
      return {
        code: RSErrorCode.missingOpenBracket,
        from: pos,
        to: pos + 1,
        params: [symbol]
      };
    }

    if (top.bracket !== expectedOpen) {
      return {
        code: RSErrorCode.bracketMismatch,
        from: pos,
        to: pos + 1,
        params: [openToClose(top.bracket), symbol]
      };
    }

    stack.pop();
  }

  if (stack.length > 0) {
    const unclosed = stack[0];
    return {
      code: RSErrorCode.missingCloseBracket,
      from: unclosed.index,
      to: unclosed.index + 1,
      params: [unclosed.bracket]
    };
  }

  return null;
}

function isOpenBracket(symbol: string): symbol is OpenBracket {
  return symbol === '(' || symbol === '[' || symbol === '{';
}

function isCloseBracket(symbol: string): symbol is CloseBracket {
  return symbol === ')' || symbol === ']' || symbol === '}';
}

function openToClose(symbol: OpenBracket): CloseBracket {
  switch (symbol) {
    case '(':
      return ')';
    case '[':
      return ']';
    case '{':
      return '}';
  }
}

function closeToOpen(symbol: CloseBracket): OpenBracket {
  switch (symbol) {
    case ')':
      return '(';
    case ']':
      return '[';
    case '}':
      return '{';
  }
}

function isDoubleParenthesis(expression: string, pos: number): boolean {
  const isOpenDoubleParenthesis = expression[pos] === '(' && expression[pos + 1] === '(';
  if (!isOpenDoubleParenthesis) {
    return false;
  }

  const outerClose = findMatchingCloseParen(expression, pos);
  const innerClose = findMatchingCloseParen(expression, pos + 1);
  if (outerClose < 0 || innerClose < 0) {
    return false;
  }

  return outerClose === innerClose + 1;
}

function findMatchingCloseParen(expression: string, openPos: number): number {
  if (expression[openPos] !== '(') {
    return -1;
  }

  const stack: OpenBracket[] = [];
  for (let index = openPos; index < expression.length; index++) {
    const symbol = expression[index];
    if (isOpenBracket(symbol)) {
      stack.push(symbol);
      continue;
    }
    if (!isCloseBracket(symbol)) {
      continue;
    }
    const top = stack.pop();
    if (top === undefined || top !== closeToOpen(symbol)) {
      return -1;
    }
    if (stack.length === 0) {
      return index;
    }
  }

  return -1;
}
