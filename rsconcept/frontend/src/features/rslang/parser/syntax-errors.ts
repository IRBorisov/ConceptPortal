/**
 * Module: Syntactic errors reporting.
 */

import { type AstNode, visitAstDFS } from '@/utils/parsing';

import { type ErrorReporter, RSErrorCode } from '../models/error';
import { TokenID } from '../models/language';

import { Variable } from './parser.terms';

export function extractSyntaxErrors(ast: AstNode, reporter: ErrorReporter) {
  visitAstDFS(ast, node => extractInternal(node, reporter));
}

// ====== Internals =========
function extractInternal(node: AstNode, reporter: ErrorReporter) {
  if (node.typeID !== TokenID.ERROR) {
    return;
  }
  if (node.parent === null) {
    return reporter({
      code: RSErrorCode.syntax,
      position: node.from
    });
  }

  if (node.parent.children[node.parent.children.length - 1] === node && node.parent.children[0].data.value === '(') {
    return reporter({
      code: RSErrorCode.missingParenthesis,
      position: node.from
    });
  }

  if (node.parent.children[node.parent.children.length - 1] === node && node.parent.children[0].data.value === '{') {
    return reporter({
      code: RSErrorCode.missingCurlyBrace,
      position: node.from
    });
  }

  if (node.parent.typeID === Variable) {
    return reporter({
      code: RSErrorCode.expectedLocal,
      position: node.parent.from
    });
  }

  reporter({
    code: RSErrorCode.syntax,
    position: node.from
  });
}