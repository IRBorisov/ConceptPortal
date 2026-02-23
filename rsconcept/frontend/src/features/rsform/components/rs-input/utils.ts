import { syntaxTree } from '@codemirror/language';
import { type EditorState } from '@uiw/react-codemirror';

import { type CMSyntaxNode, findEnvelopingNodes } from '@/utils/codemirror';

import { IdentifierTokens } from './parse';

/** Retrieves globalID from position in Editor. */
export function findAliasAt(pos: number, state: EditorState): { alias: string; node: CMSyntaxNode; } | null {
  const { from: lineStart, to: lineEnd, text } = state.doc.lineAt(pos);
  const nodes = findEnvelopingNodes(pos, pos, syntaxTree(state), IdentifierTokens);
  for (const node of nodes) {
    if (node.to <= lineEnd && node.from >= lineStart) {
      return { alias: text.slice(node.from - lineStart, node.to - lineStart), node: node };
    }
  }
  return null;
}
