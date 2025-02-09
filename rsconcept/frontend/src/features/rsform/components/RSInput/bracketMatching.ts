import { bracketMatching, MatchResult } from '@codemirror/language';
import { Decoration, EditorView } from '@codemirror/view';

import { BRACKETS_THEME } from '@/styling/color';

const matchingMark = Decoration.mark({ class: 'cc-matchingBracket' });
const nonMatchingMark = Decoration.mark({ class: 'cc-nonmatchingBracket' });

function bracketRender(match: MatchResult) {
  const decorations = [];
  const mark = match.matched ? matchingMark : nonMatchingMark;
  decorations.push(mark.range(match.start.from, match.start.to));
  if (match.end) {
    decorations.push(mark.range(match.end.from, match.end.to));
  }
  return decorations;
}

const theme = EditorView.baseTheme(BRACKETS_THEME);

export function ccBracketMatching() {
  return [
    bracketMatching({
      renderMatch: bracketRender,
      brackets: '{}[]()'
    }),
    theme
  ];
}
