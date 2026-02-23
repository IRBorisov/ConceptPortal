/**
 * Module: Parsing utilities.
 */

import { type TreeCursor } from '@lezer/common';

export const TOKEN_ERROR = 0;

/** Represents AST node data. */
export interface AstNodeData extends Record<string, unknown> {
  dataType: string;
  value: unknown;
}

/** Represents AST structured node base. */
export interface AstNodeBase {
  typeID: number;
  data: AstNodeData;
  annotation?: Record<string, unknown>;
}

/** Represents AST structured node. */
export interface AstNode extends Record<string, unknown>, AstNodeBase {
  from: number;
  to: number;
  hasError: boolean;
  parenthesis?: boolean;
  parent: AstNode | null;
  children: AstNode[];
}

/** Represents AST node. */
export interface FlatAstNode extends Record<string, unknown>, AstNodeBase {
  uid: number;
  parent: number;
  from: number;
  to: number;
}

/** Represents Syntax tree flat representation. */
export type FlatAST = FlatAstNode[];

/** Builds AST tree from a given tree cursor. */
export function buildTree(cursor: TreeCursor, parent: AstNode | null = null): AstNode {
  const node = cursor.node;

  const result: AstNode = {
    typeID: node.type.isError ? 0 : node.type.id,
    from: node.from,
    to: node.to,
    hasError: node.type.isError,
    data: node.type.isError ?
      { dataType: 'null', value: null } :
      { dataType: 'string', value: node.type.name },
    parent,
    children: []
  };

  if (cursor.firstChild()) {
    do {
      const child = buildTree(cursor, result);
      if (child.hasError) {
        result.hasError = true;
      }
      result.children.push(child);
    } while (cursor.nextSibling());
    cursor.parent();
  }
  return result;
}

/** Flattens AST tree to a array form. */
export function flattenAst(node: AstNode, parent = TOKEN_ERROR, out: FlatAST = []): FlatAST {
  const uid = out.length;
  out.push({
    uid: uid,
    parent: parent,
    typeID: node.typeID,
    from: node.from,
    to: node.to,
    data: node.data,
    annotation: node.annotation
  });
  for (const child of node.children) {
    flattenAst(child, uid, out);
  }
  return out;
};

/** Visits AST tree in depth-first order. */
export function visitAstDFS(node: AstNode, callback: (node: AstNode) => void) {
  for (const child of node.children) {
    visitAstDFS(child, callback);
  }
  callback(node);
}

/** Prints AST tree. */
export function printAst(node: AstNode, printNode: (node: AstNode) => string): string {
  let children: string = '';
  for (const child of node.children) {
    children += `${printAst(child, printNode)}`;
  }
  return `[${printNode(node)}${children}]`;
}

/** Extracts node text. */
export function getNodeText(node: AstNode): string {
  if (node.data.dataType === 'string' && typeof node.data.value === 'string') {
    return node.data.value;
  }
  return `NO DATA NODE: ${node.typeID}`;
}

/** Extracts node indices. */
export function getNodeIndices(node: AstNode): number[] {
  if (node.data.dataType === 'string[]' && Array.isArray(node.data.value)) {
    return (node.data.value as string[]).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  }
  return [];
}
