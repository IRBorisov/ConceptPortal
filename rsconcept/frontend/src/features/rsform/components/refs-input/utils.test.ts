import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';

import { NaturalLanguage } from './parse';
import { findReferenceAt } from './utils';

function stateWith(text: string) {
  return EditorState.create({
    doc: text,
    extensions: [NaturalLanguage]
  });
}

describe('findReferenceAt', () => {
  it('parses Latin entity aliases from Lezer RefEntity nodes', () => {
    const text = '@{A55|sing,datv}';
    const result = findReferenceAt(2, stateWith(text));
    expect(result).toEqual({
      ref: { entity: 'A55', tags: ['sing', 'datv'] },
      start: 0,
      end: text.length
    });
  });

  it('does not throw when Lezer recovers Cyrillic lookalike as RefSyntactic', () => {
    // Cyrillic А (U+0410) — domain treats as entity; Lezer may tag as RefSyntactic
    const text = '@{А55|sing,datv}';
    const result = findReferenceAt(2, stateWith(text));
    expect(result).toEqual({
      ref: { entity: 'А55', tags: ['sing', 'datv'] },
      start: 0,
      end: text.length
    });
  });

  it('returns undefined for text that is not a valid reference', () => {
    expect(findReferenceAt(0, stateWith('plain text'))).toBeUndefined();
  });
});
