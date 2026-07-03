/**
 * Expression-level diagnostics (no AST required) and error deduplication.
 */

import { RSErrorCode, type RSErrorDescription } from '../../error';

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

export function extractForbiddenCharacterErrors(expression: string): RSErrorDescription[] {
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

export function extractBracketErrors(expression: string): RSErrorDescription | null {
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

export function deduplicateErrors(errors: RSErrorDescription[]): RSErrorDescription[] {
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
  const filtered = result.filter(
    error => error.code !== RSErrorCode.unknownSyntax || !specific.some(item => rangesOverlap(error, item))
  );
  return collapseContiguousUnknownSyntax(filtered);
}

function collapseContiguousUnknownSyntax(errors: RSErrorDescription[]): RSErrorDescription[] {
  const unknowns = errors.filter(error => error.code === RSErrorCode.unknownSyntax);
  if (unknowns.length <= 1) {
    return errors;
  }

  const others = errors.filter(error => error.code !== RSErrorCode.unknownSyntax);
  const sorted = [...unknowns].sort((left, right) => left.from - right.from || left.to - right.to);
  const merged: RSErrorDescription[] = [];

  let clusterFrom = sorted[0].from;
  let clusterTo = sorted[0].to;

  for (let index = 1; index < sorted.length; index++) {
    const error = sorted[index];
    if (error.from <= clusterTo) {
      clusterTo = Math.max(clusterTo, error.to);
      continue;
    }

    merged.push({ code: RSErrorCode.unknownSyntax, from: clusterFrom, to: clusterTo });
    clusterFrom = error.from;
    clusterTo = error.to;
  }

  merged.push({ code: RSErrorCode.unknownSyntax, from: clusterFrom, to: clusterTo });
  return [...others, ...merged];
}

function rangesOverlap(a: RSErrorDescription, b: RSErrorDescription): boolean {
  return a.from < b.to && b.from < a.to;
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
