import { syntaxTree } from '@codemirror/language';
import { type EditorState } from '@uiw/react-codemirror';

import { findEnvelopingNodes } from '@/utils/codemirror';

import { parseEntityReference, parseSyntacticReference } from '../../models/language-api';

import { RefEntity } from './parse/parser.terms';
import { ReferenceTokens } from './parse';

/**
 * Retrieves reference from position in Editor.
 */
export function findReferenceAt(pos: number, state: EditorState) {
  const nodes = findEnvelopingNodes(pos, pos, syntaxTree(state), ReferenceTokens);
  if (nodes.length !== 1) {
    return undefined;
  }
  const start = nodes[0].from;
  const end = nodes[0].to;
  const text = state.doc.sliceString(start, end);
  if (nodes[0].type.id === RefEntity) {
    return { ref: parseEntityReference(text), start, end };
  } else {
    return { ref: parseSyntacticReference(text), start, end };
  }
}
