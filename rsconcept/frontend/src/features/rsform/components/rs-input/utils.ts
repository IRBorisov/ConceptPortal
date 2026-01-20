import { syntaxTree } from '@codemirror/language';
import { type EditorState } from '@uiw/react-codemirror';

import { findEnvelopingNodes } from '@/utils/codemirror';

import { GlobalTokens } from './parse';

/**
 * Retrieves globalID from position in Editor.
 */
export function findAliasAt(pos: number, state: EditorState) {
  const { from: lineStart, to: lineEnd, text } = state.doc.lineAt(pos);
  const nodes = findEnvelopingNodes(pos, pos, syntaxTree(state), GlobalTokens);
  let alias = '';
  let start = 0;
  let end = 0;
  nodes.forEach(node => {
    if (node.to <= lineEnd && node.from >= lineStart) {
      alias = text.slice(node.from - lineStart, node.to - lineStart);
      start = node.from;
      end = node.to;
    }
  });
  return { alias, start, end };
}
