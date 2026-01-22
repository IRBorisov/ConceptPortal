/**
 * Module: CodeMirror customizations.
 */
import { syntaxTree } from '@codemirror/language';
import { type NodeType, type Tree, type TreeCursor } from '@lezer/common';
import { type ReactCodeMirrorRef, type SelectionRange } from '@uiw/react-codemirror';

/** Represents syntax tree node data. */
interface SyntaxNode {
  type: NodeType;
  from: number;
  to: number;
}

/** Represents syntax tree cursor data. */
interface CursorNode extends SyntaxNode {
  isLeaf: boolean;
}

export function cursorNode({ type, from, to }: TreeCursor, isLeaf = false): CursorNode {
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
  for (; ;) {
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
    for (; ;) {
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

/** Retrieves a list of all nodes, containing given range and corresponding to a filter. */
export function findEnvelopingNodes(
  from: number,
  to: number,
  tree: Tree,
  filter?: readonly number[]
): SyntaxNode[] {
  const result: SyntaxNode[] = [];
  tree.cursor().iterate(node => {
    if ((!filter || filter.includes(node.type.id)) && node.to >= from && node.from <= to) {
      result.push({
        type: node.type,
        to: node.to,
        from: node.from
      });
    }
  });
  return result;
}

/** Retrieves a list of all nodes, contained in given range and corresponding to a filter. */
export function findContainedNodes(
  start: number,
  finish: number,
  tree: Tree,
  filter?: readonly number[]
): SyntaxNode[] {
  const result: SyntaxNode[] = [];
  tree.cursor().iterate(node => {
    if ((!filter || filter.includes(node.type.id)) && node.to <= finish && node.from >= start) {
      result.push({
        type: node.type,
        to: node.to,
        from: node.from
      });
    }
  });
  return result;
}

/**
 * Wrapper class for CodeMirror editor.
 *
 * Assumes single range selection.
 */
export class CodeMirrorWrapper {
  ref: Required<ReactCodeMirrorRef>;

  constructor(object: Required<ReactCodeMirrorRef>) {
    this.ref = object;
  }

  getPrevSymbol(): string {
    const selection = this.getSelection();
    return this.getText(selection.from - 1, selection.from);
  }

  getText(from: number, to: number): string {
    return this.ref.view.state.doc.sliceString(from, to);
  }

  getWord(position: number): SelectionRange | null {
    return this.ref.view.state.wordAt(position);
  }

  getSelection(): SelectionRange {
    return this.ref.view.state.selection.main;
  }

  getSelectionText(): string {
    const selection = this.getSelection();
    return this.ref.view.state.doc.sliceString(selection.from, selection.to);
  }

  setSelection(from: number, to: number) {
    this.ref.view.dispatch({
      selection: {
        anchor: from,
        head: to
      }
    });
  }

  replaceWith(data: string) {
    this.ref.view.dispatch(this.ref.view.state.replaceSelection(data));
  }

  envelopeWith(left: string, right: string) {
    const selection = this.getSelection();
    const newSelection = !selection.empty
      ? {
        anchor: selection.from,
        head: selection.to + left.length + right.length
      }
      : {
        anchor: selection.to + left.length + right.length - 1
      };
    this.ref.view.dispatch({
      changes: [
        { from: selection.from, insert: left },
        { from: selection.to, insert: right }
      ],
      selection: newSelection
    });
  }

  /**
   * Access list of SyntaxNodes contained in current selection.
   */
  getContainedNodes(tokenFilter?: readonly number[]): SyntaxNode[] {
    const selection = this.getSelection();
    return findContainedNodes(selection.from, selection.to, syntaxTree(this.ref.view.state), tokenFilter);
  }

  /**
   * Access list of SyntaxNodes enveloping current selection.
   */
  getEnvelopingNodes(tokenFilter?: readonly number[]): SyntaxNode[] {
    const selection = this.getSelection();
    return findEnvelopingNodes(selection.from, selection.to, syntaxTree(this.ref.view.state), tokenFilter);
  }

  /**
   * Access list of SyntaxNodes contained in documents.
   */
  getAllNodes(tokenFilter?: readonly number[]): SyntaxNode[] {
    return findContainedNodes(0, this.ref.view.state.doc.length, syntaxTree(this.ref.view.state), tokenFilter);
  }

  /**
   * Enlarges selection to nearest spaces.
   *
   * If tokenFilter is provided then minimal valid token is selected.
   */
  fixSelection(tokenFilter?: readonly number[]) {
    const selection = this.getSelection();
    if (tokenFilter) {
      const nodes = findEnvelopingNodes(selection.from, selection.to, syntaxTree(this.ref.view.state), tokenFilter);
      if (nodes.length > 0) {
        const target = nodes[nodes.length - 1];
        this.setSelection(target.from, target.to);
        return;
      }
    }
    const startWord = this.ref.view.state.wordAt(selection.from);
    const endWord = this.ref.view.state.wordAt(selection.to);
    if (startWord || endWord) {
      this.setSelection(startWord?.from ?? selection.from, endWord?.to ?? selection.to);
    }
  }
}
