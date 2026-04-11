import { RangeSetBuilder } from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate
} from '@codemirror/view';

import { getRSErrorRange, type RSErrorDescription } from '@/features/rslang';

import { APP_COLORS } from '@/styling/colors';

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

class ErrorRangesPlugin {
  decorations: DecorationSet;
  errors: readonly RSErrorDescription[];

  constructor(view: EditorView, errors: readonly RSErrorDescription[]) {
    this.errors = errors;
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const docLength = view.state.doc.length;
    const sortedErrors = [...this.errors].sort((left, right) => {
      if (left.from !== right.from) {
        return left.from - right.from;
      }
      return left.to - right.to;
    });

    const nonOverlappingErrors: RSErrorDescription[] = [];
    let lastTo = -1;
    for (const error of sortedErrors) {
      if (error.from >= lastTo) {
        nonOverlappingErrors.push(error);
        lastTo = error.to;
      }
    }

    for (const error of nonOverlappingErrors) {
      const range = getSafeErrorRange(error, docLength);
      if (!range) {
        continue;
      }

      builder.add(range.from, Math.min(range.from + 1, range.to), errorStartMark);
      builder.add(range.from, range.to, errorRangeMark);
      builder.add(Math.max(range.to - 1, range.from), range.to, errorEndMark);
    }

    return builder.finish();
  }
}

export function rsErrorRanges(errors: readonly RSErrorDescription[]) {
  return [
    ViewPlugin.fromClass(
      class extends ErrorRangesPlugin {
        constructor(view: EditorView) {
          super(view, errors);
        }
      },
      {
        decorations: plugin => plugin.decorations
      }
    ),
    errorRangesTheme
  ];
}

function getSafeErrorRange(
  error: RSErrorDescription,
  docLength: number
): { from: number; to: number; } | null {
  if (docLength <= 0) {
    return null;
  }

  const range = getRSErrorRange(error);
  const from = Math.min(Math.max(range.from, 0), docLength - 1);
  const to = Math.min(Math.max(range.to, from + 1), docLength);
  if (to <= from) {
    return null;
  }
  return { from, to };
}
