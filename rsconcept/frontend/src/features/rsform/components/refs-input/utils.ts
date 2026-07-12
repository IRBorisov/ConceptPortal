import { syntaxTree } from '@codemirror/language';
import { type EditorState } from '@uiw/react-codemirror';

import { type EntityReference, type SyntacticReference } from '@rsconcept/domain/cctext';
import { parseReference } from '@rsconcept/domain/cctext/language-api';

import { findEnvelopingNodes } from '@/utils/codemirror';

import { ReferenceTokens } from './parse';

export interface ParsedReferenceAt {
  ref: EntityReference | SyntacticReference;
  start: number;
  end: number;
}

/**
 * Retrieves reference from position in Editor.
 *
 * Uses domain {@link parseReference} as source of truth for reference kind.
 * Lezer may recover invalid aliases (e.g. Cyrillic lookalikes) as the wrong
 * reference token; trusting the node type alone can throw on hover/click.
 */
export function findReferenceAt(pos: number, state: EditorState): ParsedReferenceAt | null {
  const nodes = findEnvelopingNodes(pos, pos, syntaxTree(state), ReferenceTokens);
  if (nodes.length !== 1) {
    return null;
  }
  const start = nodes[0].from;
  const end = nodes[0].to;
  const text = state.doc.sliceString(start, end);
  const parsed = parseReference(text);
  if (!parsed) {
    return null;
  }
  return { ref: parsed.data, start, end };
}
