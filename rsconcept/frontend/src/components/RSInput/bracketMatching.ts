import { bracketMatching, MatchResult } from '@codemirror/language';
import { Decoration, EditorView } from '@codemirror/view';

const matchingMark = Decoration.mark({class: "cc-matchingBracket"});
const nonmatchingMark = Decoration.mark({class: "cc-nonmatchingBracket"});

function bracketRender(match: MatchResult) {
  const decorations = [];
  const mark = match.matched ? matchingMark : nonmatchingMark;
  decorations.push(mark.range(match.start.from, match.start.to));
  if (match.end) {
    decorations.push(mark.range(match.end.from, match.end.to));
  }
  return decorations;
}

const darkTheme = EditorView.baseTheme({
  '.cc-matchingBracket': {
    fontWeight: 600,
  },
  '.cc-nonmatchingBracket': {
    color: '#ef4444',
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: '#734f00',
  },
});

const lightTheme = EditorView.baseTheme({
  '.cc-matchingBracket': {
    fontWeight: 600,
  },
  '.cc-nonmatchingBracket': {
    color: '#ef4444',
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: '#dae6f2',
  },
});

export function ccBracketMatching(darkMode: boolean) {
  return [bracketMatching({ renderMatch: bracketRender }), darkMode ? darkTheme : lightTheme];
}