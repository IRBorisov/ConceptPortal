import { NodeType, Tree, TreeCursor } from "@lezer/common"

export type CursorNode = {
  type: NodeType
  from: number
  to: number
  isLeaf: boolean
}

function cursorNode({ type, from, to }: TreeCursor, isLeaf = false): CursorNode {
  return { type, from, to, isLeaf }
}

type TreeTraversalOptions = {
  beforeEnter?: (cursor: TreeCursor) => void
  onEnter: (node: CursorNode) => false | void
  onLeave?: (node: CursorNode) => false | void
}

export function traverseTree(tree: Tree, { beforeEnter, onEnter, onLeave, }: TreeTraversalOptions) {
  const cursor = tree.cursor();
  for (;;) {
    let node = cursorNode(cursor)
    let leave = false
    const enter = !node.type.isAnonymous
    if (enter && beforeEnter) beforeEnter(cursor)
    node.isLeaf = !cursor.firstChild()
    if (enter) {
      leave = true
      if (onEnter(node) === false) return
    }
    if (!node.isLeaf) continue
    for (;;) {
      node = cursorNode(cursor, node.isLeaf)
      if (leave && onLeave) if (onLeave(node) === false) return;
      leave = cursor.type.isAnonymous
      node.isLeaf = false
      if (cursor.nextSibling()) break;
      if (!cursor.parent()) return;
      leave = true
    }
  }
}

export function printTree(tree: Tree): string {
  const state = {
    output: "",
    prefixes: [] as string[]
  }
  traverseTree(tree, {
    onEnter: node => {
      state.output += "[";
      state.output += node.type.name;
    },
    onLeave: () => {
      state.output += "]";
    },
  })
  return state.output;
}
