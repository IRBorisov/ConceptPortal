import { NodeType, Tree, TreeCursor } from '@lezer/common'

import { IEntityReference, ISyntacticReference, parseGrammemes } from '../models/language'
import { IConstituenta } from '../models/rsform'
import { colorfgGrammeme,IColorTheme } from './color'
import { describeConstituentaTerm, labelCstTypification, labelGrammeme } from './labels'

/**
 * Represents syntax tree node data.
*/
export interface SyntaxNode {
  type: NodeType
  from: number
  to: number
}

/**
 * Represents syntax tree cursor data.
*/
export interface CursorNode
extends SyntaxNode {
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

/**
 * Implements depth-first traversal.
*/
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

/**
 * Prints tree to compact string.
*/
export function printTree(tree: Tree): string {
  const state = {
    output: '',
    prefixes: [] as string[]
  }
  traverseTree(tree, {
    onEnter: node => {
      state.output += '[';
      state.output += node.type.name;
    },
    onLeave: () => {
      state.output += ']';
    },
  })
  return state.output;
}

/**
 * Reteives a list of all nodes, containing given range and corresponding to a filter.
*/
export function findEnvelopingNodes(start: number, finish: number, tree: Tree, filter?: number[]): SyntaxNode[] {
  const result: SyntaxNode[] = [];
  tree.cursor().iterate(
    node => {
    if (
      (!filter || filter.includes(node.type.id)) &&
      node.to >= start && node.from <= finish
    ) {
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
 * Reteives a list of all nodes, contained in given range and corresponding to a filter.
*/
export function findContainedNodes(start: number, finish: number, tree: Tree, filter?: number[]): SyntaxNode[] {
  const result: SyntaxNode[] = [];
  tree.cursor().iterate(
    node => {
    if (
      (!filter || filter.includes(node.type.id)) &&
      node.to <= start && node.from >= finish
    ) {
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
  dom.className = 'overflow-y-auto border shadow-md max-h-[25rem] max-w-[25rem] min-w-[10rem] w-fit z-tooltip text-sm px-2 py-2';
  
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
  const DIMENSIONS = 'max-h-[25rem] max-w-[25rem] min-w-[10rem] w-fit z-tooltip px-2 py-2';
  const LAYOUT = 'flex flex-col gap-1 overflow-y-auto'

  const dom = document.createElement('div');
  dom.className = `${DIMENSIONS} ${LAYOUT} border shadow-md text-sm select-none cursor-auto`;

  const term = document.createElement('p');
  term.innerHTML = `<b>${ref.entity}:</b> ${describeConstituentaTerm(cst)}`;
  dom.appendChild(term);

  const grams = document.createElement('div');
  grams.className = 'flex flex-wrap gap-1';
  parseGrammemes(ref.form).forEach(
  gramStr => {
    const gram = document.createElement('div');
    gram.id =`tooltip-${gramStr}`;
    gram.className='min-w-[3rem] px-1 text-sm text-center rounded-md whitespace-nowrap';
    gram.style.borderWidth = '1px';
    gram.style.borderColor = colorfgGrammeme(gramStr, colors);
    gram.style.color = colorfgGrammeme(gramStr, colors);
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
export function domTooltipSyntacticReference(ref: ISyntacticReference) {
  const DIMENSIONS = 'max-h-[25rem] max-w-[25rem] min-w-[10rem] w-fit z-tooltip px-2 py-2';
  const LAYOUT = 'flex flex-col gap-1 overflow-y-auto'

  const dom = document.createElement('div');
  dom.className = `${DIMENSIONS} ${LAYOUT} border shadow-md text-sm select-none cursor-auto`;

  const title = document.createElement('p');
  title.innerHTML = '<b>Синтаксическая ссылка</b>';
  dom.appendChild(title);

  const offset = document.createElement('p');
  offset.innerHTML = `<b>Смещение:</b> ${ref.offset}`;
  dom.appendChild(offset);

  const nominal = document.createElement('p');
  nominal.innerHTML = `<b>Начальная форма:</b> ${ref.nominal}`;
  dom.appendChild(nominal);
    
  return { dom: dom };
}