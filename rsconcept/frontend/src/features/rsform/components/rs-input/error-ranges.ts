import { RangeSetBuilder } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';

import { type RSErrorDescription } from '@/domain/rslang';

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

  constructor(errors: readonly RSErrorDescription[]) {
    this.errors = errors;
    this.decorations = this.buildDecorations();
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations();
    }
  }

  buildDecorations(): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
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
      builder.add(error.from, Math.min(error.from + 1, error.to), errorStartMark);
      builder.add(error.from, error.to, errorRangeMark);
      builder.add(Math.max(error.to - 1, error.from), error.to, errorEndMark);
    }

    return builder.finish();
  }
}

/** Returns a list of extensions for displaying error ranges in the editor. */
export function rsErrorRanges(errors: readonly RSErrorDescription[]) {
  return [
    ViewPlugin.fromClass(
      class extends ErrorRangesPlugin {
        constructor() {
          super(errors);
        }
      },
      {
        decorations: plugin => plugin.decorations
      }
    ),
    errorRangesTheme
  ];
}
