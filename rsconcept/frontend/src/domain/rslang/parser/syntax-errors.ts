/**
 * Module: Syntactic errors reporting.
 */

import { type AstNode, visitAstDFS } from '@/utils/parsing';

import { annotateError } from '../ast-annotations';
import { type ErrorReporter, RSErrorCode, type RSErrorDescription } from '../error';

import { Variable } from './parser.terms';
import { TokenID } from './token';

export function extractSyntaxErrors(
  ast: AstNode,
  expression: string,
  reporter: ErrorReporter,
  annotateErrors: boolean = false
) {
  const bracketError = extractBracketErrors(expression);
  if (bracketError !== null) {
    reporter(bracketError);
    if (annotateErrors) {
      annotateError(ast, bracketError.code, bracketError.params);
    }
  }
  const hasBracketErrors = bracketError !== null;
  visitAstDFS(ast, node => extractInternal(node, reporter, annotateErrors, hasBracketErrors));
}

// ====== Internals =========
function extractInternal(node: AstNode, reporter: ErrorReporter, annotateErrors: boolean, hasBracketErrors: boolean) {
  if (node.typeID !== TokenID.ERROR) {
    return;
  }

  function emit(target: AstNode, code: RSErrorCode, from: number, to: number) {
    reporter({ code, from, to });
    if (annotateErrors) {
      annotateError(target, code);
    }
  }

  if (node.parent === null) {
    if (!hasBracketErrors) {
      return emit(node, RSErrorCode.syntax, node.from, node.to);
    }
    return;
  }

  if (node.parent.typeID === Variable) {
    const parent = node.parent;
    reporter({
      code: RSErrorCode.expectedLocal,
      from: parent.from,
      to: parent.to
    });
    if (annotateErrors) {
      annotateError(parent, RSErrorCode.expectedLocal);
    }
    return;
  }

  if (!hasBracketErrors) {
    emit(node, RSErrorCode.syntax, node.from, node.to);
  }
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
        code: RSErrorCode.bracketMismatch,
        from: pos,
        to: pos + 1,
        params: [expectedOpen, symbol]
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
    const code = missingBracketCode(unclosed.bracket);
    return {
      code,
      from: expression.length,
      to: expression.length
    };
  }

  return null;
}

function missingBracketCode(bracket: OpenBracket): RSErrorCode {
  switch (bracket) {
    case '(':
      return RSErrorCode.missingParenthesis;
    case '[':
      return RSErrorCode.missingSquareBracket;
    case '{':
      return RSErrorCode.missingCurlyBrace;
  }
  return RSErrorCode.syntax;
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
