import { bracketMatching, MatchResult } from '@codemirror/language';
import { Decoration, EditorView } from '@codemirror/view';

const matchingMark = Decoration.mark({class: "cc-matchingBracket"}),
      nonmatchingMark = Decoration.mark({class: "cc-nonmatchingBracket"})

function bracketRender(match: MatchResult) {
  const decorations = []
  const mark = match.matched ? matchingMark : nonmatchingMark
  decorations.push(mark.range(match.start.from, match.start.to))
  if (match.end) decorations.push(mark.range(match.end.from, match.end.to))
  return decorations
}

export function ccBracketMatching(darkMode: boolean) {
  const bracketTheme = EditorView.baseTheme({
    '.cc-matchingBracket': {
      fontWeight: 600,
    },
    '.cc-nonmatchingBracket': {
      color: '#ef4444',
      fontWeight: 700,
    },
    '&.cm-focused .cc-matchingBracket': {
      backgroundColor: darkMode ? '#734f00' : '#dae6f2',
    },
  });

  return [bracketMatching({ renderMatch: bracketRender }), bracketTheme];
}