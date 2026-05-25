import { type NodeType, type Tree, type TreeCursor } from '@lezer/common';
export { type TreeCursor } from '@lezer/common';

/** Represents syntax tree node data. */
export interface CMSyntaxNode {
  type: NodeType;
  from: number;
  to: number;
}

/** Prints tree to compact string. */
export function printTree(tree: Tree): string {
  const state = {
    output: '',
    prefixes: [] as string[]
  };
  traverseTree(tree, {
    onEnter: node => {
      state.output += '[';
      state.output += node.type.name;
    },
    onLeave: () => {
      state.output += ']';
    }
  });
  return state.output;
}

// ======== Internals ========

interface CursorNode extends CMSyntaxNode {
  isLeaf: boolean;
}

function cursorNode({ type, from, to }: TreeCursor, isLeaf = false): CursorNode {
  return { type, from, to, isLeaf };
}

interface TreeTraversalOptions {
  beforeEnter?: (cursor: TreeCursor) => void;
  onEnter: (node: CursorNode) => false | void;
  onLeave?: (node: CursorNode) => false | void;
}

/** Implements depth-first traversal. */
function traverseTree(tree: Tree, { beforeEnter, onEnter, onLeave }: TreeTraversalOptions) {
  const cursor = tree.cursor();
  for (;;) {
    let node = cursorNode(cursor);
    let leave = false;
    const enter = !node.type.isAnonymous;
    if (enter && beforeEnter) beforeEnter(cursor);
    node.isLeaf = !cursor.firstChild();
    if (enter) {
      leave = true;
      if (onEnter(node) === false) return;
    }
    if (!node.isLeaf) continue;
    for (;;) {
      node = cursorNode(cursor, node.isLeaf);
      if (leave && onLeave) if (onLeave(node) === false) return;
      leave = cursor.type.isAnonymous;
      node.isLeaf = false;
      if (cursor.nextSibling()) break;
      if (!cursor.parent()) return;
      leave = true;
    }
  }
}
