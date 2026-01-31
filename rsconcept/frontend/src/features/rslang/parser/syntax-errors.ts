/**
 * Module: Syntactic errors reporting.
 */

import { type AstNode, visitAstDFS } from '@/utils/parsing';

import { type ErrorReporter, RSErrorCode } from '../models/error';
import { TokenID } from '../models/language';
export function extractSyntaxErrors(ast: AstNode, reporter: ErrorReporter) {
  visitAstDFS(ast, node => extractInternal(node, reporter));
}

// ====== Internals =========
function extractInternal(node: AstNode, reporter: ErrorReporter) {
  if (node.typeID !== TokenID.ERROR) {
    return;
  }
  if (node.parent === null) {
    reporter({
      code: RSErrorCode.syntax,
      position: node.from
    });
    return;
  }
  switch (node.parent.typeID) {
    // TODO: Add more cases
  }
  reporter({
    code: RSErrorCode.syntax,
    position: node.from
  });
}