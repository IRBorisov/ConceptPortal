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
  uid: number;
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
  parent: number | null;
  from: number;
  to: number;
}

/** Represents Syntax tree flat representation. */
export type FlatAST = FlatAstNode[];

/** Builds AST tree from a given tree cursor, generating unique uids for each node. */
export function buildTree(cursor: TreeCursor): AstNode {
  let nextUid = 1;
  function genUid() {
    return nextUid++;
  }
  return buildTreeInternal(cursor, null, genUid);
}

/** Flattens AST tree to a array form. */
export function flattenAst(node: AstNode, parent: number | null = null, out: FlatAST = []): FlatAST {
  out.push({
    uid: node.uid,
    parent: parent,
    typeID: node.typeID,
    from: node.from,
    to: node.to,
    data: node.data,
    annotation: node.annotation
  });
  for (const child of node.children) {
    flattenAst(child, node.uid, out);
  }
  return out;
}

/** Visits AST tree in depth-first order. */
export function visitAstDFS(node: AstNode, callback: (node: AstNode) => void) {
  for (const child of node.children) {
    visitAstDFS(child, callback);
  }
  callback(node);
}

/** Finds and returns the AstNode with the given ui. */
export function findByUid(root: AstNode, uid: number): AstNode | null {
  let found: AstNode | null = null;
  visitAstDFS(root, node => {
    if (node.uid === uid && !found) {
      found = node;
    }
  });
  return found;
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

// ======== Internals ========
function buildTreeInternal(cursor: TreeCursor, parent: AstNode | null = null, genUid: () => number): AstNode {
  const node = cursor.node;

  const result: AstNode = {
    uid: genUid(),
    typeID: node.type.isError ? 0 : node.type.id,
    from: node.from,
    to: node.to,
    hasError: node.type.isError,
    data: node.type.isError ? { dataType: 'null', value: null } : { dataType: 'string', value: node.type.name },
    parent,
    children: []
  };

  if (cursor.firstChild()) {
    do {
      const child = buildTreeInternal(cursor, result, genUid);
      if (child.hasError) {
        result.hasError = true;
      }
      result.children.push(child);
    } while (cursor.nextSibling());
    cursor.parent();
  }
  return result;
}
