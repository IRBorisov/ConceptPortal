/**
 * Module: Parsing utilities.
 */

import { type TreeCursor } from '@lezer/common';

import { PARAMETER } from './constants';

/** Represents AST structured node. */
export interface AstNode extends Record<string, unknown> {
  typeID: number;
  from: number;
  to: number;
  data: { dataType: string; value: unknown; };
  parent: AstNode | null;
  children: AstNode[];
}

/** Represents AST node. */
export interface FlatAstNode extends Record<string, unknown> {
  uid: number;
  parent: number;
  typeID: number;
  start: number;
  finish: number;
  data: {
    dataType: string;
    value: unknown;
  };
}

/** Represents Syntax tree flat representation. */
export type FlatAST = FlatAstNode[];

/** Builds AST tree from a given tree cursor. */
export function buildTree(cursor: TreeCursor, parent: AstNode | null = null): AstNode {
  const node = cursor.node;

  const result: AstNode = {
    typeID: node.type.id,
    from: node.from,
    to: node.to,
    data: {
      dataType: 'string',
      value: node.type.name == '⚠' ? PARAMETER.errorNodeLabel : node.type.name
    },
    parent,
    children: []
  };

  if (cursor.firstChild()) {
    do {
      result.children.push(buildTree(cursor, result));
    } while (cursor.nextSibling());
    cursor.parent();
  }
  return result;
}


export function FlattenAst(node: AstNode, parent = 0, out: FlatAST = []): FlatAST {
  const uid = out.length;
  out.push({ uid, parent, typeID: node.typeID, start: node.from, finish: node.to, data: node.data });
  for (const child of node.children) {
    FlattenAst(child, uid, out);
  }
  return out;
};