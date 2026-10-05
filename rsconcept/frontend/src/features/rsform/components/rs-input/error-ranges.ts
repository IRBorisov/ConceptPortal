import { type Extension, RangeSetBuilder, StateField, type Transaction } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';

import { type RSErrorDescription } from '@rsconcept/domain/rslang';

import { APP_COLORS } from '@/styling/colors';

import { readRSContext, rsContextField } from './rs-context';

const errorRangesTheme = EditorView.baseTheme({
  '.cm-content .cc-rsErrorRange': {
    textDecoration: 'underline wavy',
    textDecorationColor: APP_COLORS.fgRed,
    textUnderlineOffset: '0.16em',
    textDecorationThickness: '1px'
  },
  '.cm-content .cc-rsErrorRangeStart': {
    borderLeft: `1px solid ${APP_COLORS.fgRed}`,
    borderTopLeftRadius: '0.2rem',
    borderBottomLeftRadius: '0.2rem'
  },
  '.cm-content .cc-rsErrorRangeEnd': {
    borderRight: `1px solid ${APP_COLORS.fgRed}`,
    borderTopRightRadius: '0.2rem',
    borderBottomRightRadius: '0.2rem'
  }
});

const errorRangeMark = Decoration.mark({
  class: 'cc-rsErrorRange'
});

const errorStartMark = Decoration.mark({
  class: 'cc-rsErrorRangeStart'
});

const errorEndMark = Decoration.mark({
  class: 'cc-rsErrorRangeEnd'
});

/** Decorations for {@link RSEditorContext.errors}: rebuilt when errors change, mapped through local edits. */
const errorRangesField = StateField.define<DecorationSet>({
  create: state => buildDecorations(readRSContext(state).errors, state.doc.length),
  update(decorations, transaction) {
    const errors = readRSContext(transaction.state).errors;
    if (errors !== readRSContext(transaction.startState).errors) {
      return buildDecorations(errors, transaction.state.doc.length);
    }
    if (!transaction.docChanged) {
      return decorations;
    }
    if (isFullReplacement(transaction)) {
      // External value replacement: error offsets refer to the new text, so rebuild instead of mapping.
      return buildDecorations(errors, transaction.state.doc.length);
    }
    return decorations.map(transaction.changes);
  },
  provide: field => EditorView.decorations.from(field)
});

/** Extensions for displaying {@link RSEditorContext.errors} ranges in the editor. */
export const rsErrorRanges: Extension = [rsContextField, errorRangesField, errorRangesTheme];

export function buildDecorations(errors: readonly RSErrorDescription[] | null, docLength: number): DecorationSet {
  if (!errors || errors.length === 0) {
    return Decoration.none;
  }
  const builder = new RangeSetBuilder<Decoration>();
  const sortedErrors = errors
    .map(error => clampErrorRange(error, docLength))
    .filter((range): range is { from: number; to: number } => range !== null)
    .sort((left, right) => {
      if (left.from !== right.from) {
        return left.from - right.from;
      }
      return left.to - right.to;
    });

  let lastTo = -1;
  for (const error of sortedErrors) {
    if (error.from < lastTo) {
      continue;
    }
    lastTo = error.to;
    builder.add(error.from, Math.min(error.from + 1, error.to), errorStartMark);
    builder.add(error.from, error.to, errorRangeMark);
    builder.add(Math.max(error.to - 1, error.from), error.to, errorEndMark);
  }

  return builder.finish();
}

function isFullReplacement(transaction: Transaction): boolean {
  const oldLength = transaction.startState.doc.length;
  if (oldLength === 0) {
    return true;
  }
  let result = false;
  transaction.changes.iterChangedRanges((fromA, toA) => {
    if (fromA === 0 && toA === oldLength) {
      result = true;
    }
  });
  return result;
}

function clampErrorRange(error: RSErrorDescription, docLength: number): { from: number; to: number } | null {
  const from = Math.max(0, Math.min(error.from, docLength));
  const to = Math.max(0, Math.min(error.to, docLength));
  if (from >= to) {
    return null;
  }
  return { from, to };
}
