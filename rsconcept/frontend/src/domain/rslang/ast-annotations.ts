/** Module: AST annotations. */

import { type AstNode } from '@/utils/parsing';

import { type ExpressionType } from './semantic/typification';
import { type RSErrorCode, type RSErrorInfo } from './error';

const AST_ERRORS_KEY = 'rsErrors' as const;
const AST_TYPE_KEY = 'rsType' as const;

/** Appends {@link ExpressionType} onto the node's `annotation.rsType`. */
export function annotateType(node: AstNode, type: ExpressionType): void {
  node.annotation = {
    ...(typeof node.annotation === 'object' && node.annotation !== null ? node.annotation : {}),
    [AST_TYPE_KEY]: type
  };
}

/** Reads {@link ExpressionType} from node's `annotation`. */
export function readTypeAnnotation(node: AstNode): ExpressionType | null {
  if (node.annotation && AST_TYPE_KEY in node.annotation) {
    return node.annotation[AST_TYPE_KEY] as ExpressionType;
  }
  return null;
}

/** Appends {@link RSErrorInfo} onto the node's `annotation.rsErrors` if not already set. */
export function annotateError(node: AstNode, code: RSErrorCode, params?: readonly string[]): void {
  if (
    typeof node.annotation === 'object' &&
    node.annotation !== null &&
    AST_ERRORS_KEY in node.annotation &&
    isAstNodeErrorRef(node.annotation[AST_ERRORS_KEY])
  ) {
    return;
  }
  const entry: RSErrorInfo = params !== undefined && params.length > 0 ? { code, params: [...params] } : { code };
  node.annotation = {
    ...(typeof node.annotation === 'object' && node.annotation !== null ? node.annotation : {}),
    [AST_ERRORS_KEY]: entry
  };
}

/** Reads validated {@link RSErrorInfo} entry from node's `annotation`. */
export function readErrorAnnotation(node: AstNode): RSErrorInfo | null {
  const raw = node.annotation?.[AST_ERRORS_KEY];
  if (isAstNodeErrorRef(raw)) {
    return raw;
  }
  return null;
}

// ====== Internal ======
function isAstNodeErrorRef(x: unknown): x is RSErrorInfo {
  if (typeof x !== 'object' || x === null || !('code' in x)) {
    return false;
  }
  const code = (x as { code: unknown }).code;
  if (typeof code !== 'number') {
    return false;
  }
  if (!('params' in x)) {
    return true;
  }
  const p = (x as { params: unknown }).params;
  if (p === undefined) {
    return true;
  }
  return Array.isArray(p) && p.every(item => typeof item === 'string');
}
