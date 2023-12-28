/**
 * Module: CodeMirror customizations.
 */
import { syntaxTree } from '@codemirror/language';
import { NodeType, Tree, TreeCursor } from '@lezer/common';
import { ReactCodeMirrorRef, SelectionRange } from '@uiw/react-codemirror';
import clsx from 'clsx';

import { IEntityReference, ISyntacticReference } from '@/models/language';
import { parseGrammemes } from '@/models/languageAPI';
import { IConstituenta } from '@/models/rsform';

import { colorFgGrammeme, IColorTheme } from './color';
import { describeConstituentaTerm, labelCstTypification, labelGrammeme } from './labels';

/**
 * Represents syntax tree node data.
 */
export interface SyntaxNode {
  type: NodeType;
  from: number;
  to: number;
}

/**
 * Represents syntax tree cursor data.
 */
export interface CursorNode extends SyntaxNode {
  isLeaf: boolean;
}

function cursorNode({ type, from, to }: TreeCursor, isLeaf = false): CursorNode {
  return { type, from, to, isLeaf };
}

type TreeTraversalOptions = {
  beforeEnter?: (cursor: TreeCursor) => void;
  onEnter: (node: CursorNode) => false | void;
  onLeave?: (node: CursorNode) => false | void;
};

/**
 * Implements depth-first traversal.
 */
export function traverseTree(tree: Tree, { beforeEnter, onEnter, onLeave }: TreeTraversalOptions) {
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

/**
 * Prints tree to compact string.
 */
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

/**
 * Retrieves a list of all nodes, containing given range and corresponding to a filter.
 */
export function findEnvelopingNodes(start: number, finish: number, tree: Tree, filter?: number[]): SyntaxNode[] {
  const result: SyntaxNode[] = [];
  tree.cursor().iterate(node => {
    if ((!filter || filter.includes(node.type.id)) && node.to >= start && node.from <= finish) {
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
 * Retrieves a list of all nodes, contained in given range and corresponding to a filter.
 */
export function findContainedNodes(start: number, finish: number, tree: Tree, filter?: number[]): SyntaxNode[] {
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
 * Create DOM tooltip for {@link Constituenta}.
 */
export function domTooltipConstituenta(cst: IConstituenta) {
  const dom = document.createElement('div');
  dom.className = clsx(
    'z-tooltip',
    'max-h-[25rem] max-w-[25rem] min-w-[10rem]',
    'p-2',
    'border shadow-md',
    'overflow-y-auto',
    'text-sm'
  );

  const alias = document.createElement('p');
  alias.innerHTML = `<b>${cst.alias}:</b> ${labelCstTypification(cst)}`;
  dom.appendChild(alias);

  if (cst.term_resolved) {
    const term = document.createElement('p');
    term.innerHTML = `<b>Термин:</b> ${cst.term_resolved}`;
    dom.appendChild(term);
  }

  if (cst.definition_formal) {
    const expression = document.createElement('p');
    expression.innerHTML = `<b>Выражение:</b> ${cst.definition_formal}`;
    dom.appendChild(expression);
  }

  if (cst.definition_resolved) {
    const definition = document.createElement('p');
    definition.innerHTML = `<b>Определение:</b> ${cst.definition_resolved}`;
    dom.appendChild(definition);
  }

  if (cst.convention) {
    const convention = document.createElement('p');
    convention.innerHTML = `<b>Конвенция:</b> ${cst.convention}`;
    dom.appendChild(convention);
  }
  return { dom: dom };
}

/**
 * Create DOM tooltip for {@link IEntityReference}.
 */
export function domTooltipEntityReference(ref: IEntityReference, cst: IConstituenta | undefined, colors: IColorTheme) {
  const dom = document.createElement('div');
  dom.className = clsx(
    'z-tooltip',
    'max-h-[25rem] max-w-[25rem] min-w-[10rem]',
    'p-2 flex flex-col',
    'border shadow-md',
    'overflow-y-auto',
    'text-sm',
    'select-none cursor-auto'
  );

  const header = document.createElement('p');
  header.innerHTML = '<b>Ссылка на конституенту</b>';
  dom.appendChild(header);

  const term = document.createElement('p');
  term.innerHTML = `<b>${ref.entity}:</b> ${describeConstituentaTerm(cst)}`;
  dom.appendChild(term);

  const grams = document.createElement('div');
  grams.className = 'flex flex-wrap gap-1 mt-1';
  parseGrammemes(ref.form).forEach(gramStr => {
    const gram = document.createElement('div');
    gram.id = `tooltip-${gramStr}`;
    gram.className = clsx('min-w-[3rem]', 'px-1', 'border rounded-md', 'text-sm text-center whitespace-nowrap');
    gram.style.borderWidth = '1px';
    gram.style.borderColor = colorFgGrammeme(gramStr, colors);
    gram.style.color = colorFgGrammeme(gramStr, colors);
    gram.style.fontWeight = '600';
    gram.style.backgroundColor = colors.bgInput;
    gram.innerText = labelGrammeme(gramStr);
    grams.appendChild(gram);
  });
  dom.appendChild(grams);
  return { dom: dom };
}

/**
 * Create DOM tooltip for {@link ISyntacticReference}.
 */
export function domTooltipSyntacticReference(ref: ISyntacticReference, masterRef: string | undefined) {
  const dom = document.createElement('div');
  dom.className = clsx(
    'z-tooltip',
    'max-h-[25rem] max-w-[25rem] min-w-[10rem]',
    'p-2 flex flex-col',
    'border shadow-md',
    'overflow-y-auto',
    'text-sm',
    'select-none cursor-auto'
  );

  const header = document.createElement('p');
  header.innerHTML = '<b>Связывание слов</b>';
  dom.appendChild(header);

  const offset = document.createElement('p');
  offset.innerHTML = `<b>Смещение:</b> ${ref.offset}`;
  dom.appendChild(offset);

  const master = document.createElement('p');
  master.innerHTML = `<b>Основная ссылка: </b> ${masterRef ?? 'не определена'}`;
  dom.appendChild(master);

  const nominal = document.createElement('p');
  nominal.innerHTML = `<b>Начальная форма:</b> ${ref.nominal}`;
  dom.appendChild(nominal);

  return { dom: dom };
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

  getText(from: number, to: number): string {
    return this.ref.view.state.doc.sliceString(from, to);
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

  insertChar(key: string) {
    this.replaceWith(key);
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
  getContainedNodes(tokenFilter?: number[]): SyntaxNode[] {
    const selection = this.getSelection();
    return findContainedNodes(selection.from, selection.to, syntaxTree(this.ref.view.state), tokenFilter);
  }

  /**
   * Access list of SyntaxNodes enveloping current selection.
   */
  getEnvelopingNodes(tokenFilter?: number[]): SyntaxNode[] {
    const selection = this.getSelection();
    return findEnvelopingNodes(selection.from, selection.to, syntaxTree(this.ref.view.state), tokenFilter);
  }

  /**
   * Access list of SyntaxNodes contained in documents.
   */
  getAllNodes(tokenFilter?: number[]): SyntaxNode[] {
    return findContainedNodes(0, this.ref.view.state.doc.length, syntaxTree(this.ref.view.state), tokenFilter);
  }

  /**
   * Enlarges selection to nearest spaces.
   *
   * If tokenFilter is provided then minimal valid token is selected.
   */
  fixSelection(tokenFilter?: number[]) {
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
