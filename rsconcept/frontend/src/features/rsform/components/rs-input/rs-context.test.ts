import { EditorState } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { describe, expect, it } from 'vitest';

import { RSErrorCode, type RSErrorDescription } from '@rsconcept/domain/rslang';

import { rsErrorRanges } from './error-ranges';
import { diffRSContext, readRSContext, rsContextField, setRSContext } from './rs-context';

function errorAt(from: number, to: number): RSErrorDescription {
  return { code: RSErrorCode.unknownSyntax, from, to };
}

function decorationRanges(state: EditorState): [number, number][] {
  const result: [number, number][] = [];
  for (const source of state.facet(EditorView.decorations)) {
    const set: DecorationSet | null = typeof source === 'function' ? null : source;
    set?.between(0, state.doc.length, (from, to, value) => {
      if ((value.spec as { class?: string }).class === 'cc-rsErrorRange') {
        result.push([from, to]);
      }
    });
  }
  return result;
}

describe('rsContextField', () => {
  it('starts empty and merges partial updates', () => {
    let state = EditorState.create({ extensions: [rsContextField] });
    expect(readRSContext(state).errors).toBeNull();

    const errors = [errorAt(0, 1)];
    state = state.update({ effects: setRSContext.of({ errors }) }).state;
    state = state.update({ effects: setRSContext.of({ activeAlias: 'X1' }) }).state;
    expect(readRSContext(state).errors).toBe(errors);
    expect(readRSContext(state).activeAlias).toBe('X1');
  });

  it('keeps the same context object when no effect is dispatched', () => {
    const state = EditorState.create({ doc: 'abc', extensions: [rsContextField] });
    const next = state.update({ changes: { from: 0, insert: 'x' } }).state;
    expect(readRSContext(next)).toBe(readRSContext(state));
  });

  it('reads an empty context when the field is not installed', () => {
    expect(readRSContext(EditorState.create()).schema).toBeNull();
  });
});

describe('diffRSContext', () => {
  it('returns only changed entries', () => {
    const state = EditorState.create({ extensions: [rsContextField] });
    const current = readRSContext(state);
    expect(diffRSContext(current, { ...current })).toBeNull();
    expect(diffRSContext(current, { ...current, activeAlias: 'D1' })).toEqual({ activeAlias: 'D1' });
  });
});

describe('rsErrorRanges', () => {
  const doc = 'X1 ∪ X2 ∪ X3';

  function withErrors(errors: RSErrorDescription[]) {
    const state = EditorState.create({ doc, extensions: [rsErrorRanges] });
    return state.update({ effects: setRSContext.of({ errors }) }).state;
  }

  it('builds decorations when errors are set', () => {
    expect(decorationRanges(withErrors([errorAt(5, 7)]))).toEqual([[5, 7]]);
  });

  it('clamps out-of-range errors and drops overlapping ones', () => {
    const state = withErrors([errorAt(0, 2), errorAt(1, 3), errorAt(10, 100)]);
    expect(decorationRanges(state)).toEqual([
      [0, 2],
      [10, doc.length]
    ]);
  });

  it('maps decorations through local edits', () => {
    const state = withErrors([errorAt(5, 7)]);
    const next = state.update({ changes: { from: 0, insert: '(' } }).state;
    expect(decorationRanges(next)).toEqual([[6, 8]]);
  });

  it('rebuilds decorations from offsets on full document replacement', () => {
    const state = withErrors([errorAt(5, 7)]);
    const next = state.update({ changes: { from: 0, to: state.doc.length, insert: 'X9 ∪ X8 ∪ X7' } }).state;
    expect(decorationRanges(next)).toEqual([[5, 7]]);
  });

  it('clears decorations when errors are reset', () => {
    const state = withErrors([errorAt(5, 7)]);
    const next = state.update({ effects: setRSContext.of({ errors: null }) }).state;
    expect(decorationRanges(next)).toEqual([]);
  });
});
