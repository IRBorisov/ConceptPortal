import { syntaxTree } from "@codemirror/language"
import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';
import { EditorState } from '@uiw/react-codemirror';

import { IConstituenta } from '@/models/rsform';
import { findEnvelopingNodes } from '@/utils/codemirror';
import { domTooltipConstituenta } from '@/utils/codemirror';
import { GlobalTokens } from './rslang';

function findAliasAt(pos: number, state: EditorState) {
  const { from: lineStart, to: lineEnd, text } = state.doc.lineAt(pos);
  const nodes = findEnvelopingNodes(pos, pos, syntaxTree(state), GlobalTokens);
  let alias = '';
  let start = 0;
  let end = 0;
  nodes.forEach(
    node => {
    if (node.to <= lineEnd && node.from >= lineStart) {
      alias = text.slice(node.from - lineStart, node.to - lineStart);
      start = node.from;
      end = node.to;
    }
  });
  return {alias, start, end};
}

const globalsHoverTooltip = (items: IConstituenta[]) => {
  return hoverTooltip((view, pos) => {
    const { alias, start, end } = findAliasAt(pos, view.state);
    const cst = items.find(cst => cst.alias === alias);
    if (!cst) {
      return null;
    }
    return {
      pos: start,
      end: end,
      above: false,
      create: () => domTooltipConstituenta(cst)
    }
  });
}

export function rsHoverTooltip(items: IConstituenta[]): Extension {
  return [globalsHoverTooltip(items)];
}
