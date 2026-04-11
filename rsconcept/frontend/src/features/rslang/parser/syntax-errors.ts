/**
 * Module: Syntactic errors reporting.
 */

import { type AstNode, visitAstDFS } from '@/utils/parsing';

import { annotateError } from '../ast-annotations';
import { type ErrorReporter, RSErrorCode } from '../error';

import { Variable } from './parser.terms';
import { TokenID } from './token';

export function extractSyntaxErrors(ast: AstNode, reporter: ErrorReporter, annotateErrors: boolean = false) {
  visitAstDFS(ast, node => extractInternal(node, reporter, annotateErrors));
}

// ====== Internals =========
function extractInternal(node: AstNode, reporter: ErrorReporter, annotateErrors: boolean) {
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
    return emit(node, RSErrorCode.syntax, node.from, node.to);
  }

  if (node.parent.children[node.parent.children.length - 1] === node && node.parent.children[0].data.value === '(') {
    return emit(node, RSErrorCode.missingParenthesis, node.from, node.to);
  }

  if (node.parent.children[node.parent.children.length - 1] === node && node.parent.children[0].data.value === '{') {
    return emit(node, RSErrorCode.missingCurlyBrace, node.from, node.to);
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

  emit(node, RSErrorCode.syntax, node.from, node.to);
}