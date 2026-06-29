/**
 * Module: Syntactic errors reporting.
 */

import { type AstNode, visitAstDFS } from '../../parsing';
import { annotateError } from '../ast-annotations';
import { type ErrorReporter, RSErrorCode, type RSErrorDescription } from '../error';

import { Filter, Function, Predicate, Variable } from './parser.terms';
import { TokenID } from './token';

export function extractSyntaxErrors(
  ast: AstNode,
  expression: string,
  reporter: ErrorReporter,
  annotateErrors: boolean = false
) {
  const collected: RSErrorDescription[] = [];
  const annotationTargets = new Map<RSErrorDescription, AstNode>();
  const collect = (error: RSErrorDescription, target?: AstNode) => {
    collected.push(error);
    if (target !== undefined) {
      annotationTargets.set(error, target);
    }
  };

  const bracketError = extractBracketErrors(expression);
  if (bracketError !== null) {
    collect(bracketError, ast);
  }
  const hasBracketErrors = bracketError !== null;
  visitAstDFS(ast, node => extractInternal(node, expression, collect, hasBracketErrors));

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
  ignoreUnknownErrors: boolean
) {
  if (node.typeID !== TokenID.ERROR) {
    return;
  }

  function emit(target: AstNode, code: RSErrorCode, params?: readonly string[]) {
    collect({ code: code, from: target.from, to: target.to, params }, target);
  }

  const classified = classifyParseError(node, expression);
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

function classifyParseError(node: AstNode, expression: string): RSErrorDescription | null {
  const filterParen = detectFilterParenMismatch(node, expression);
  if (filterParen !== null) {
    return filterParen;
  }

  return detectGlobalFuncWithoutArgs(node, expression);
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
