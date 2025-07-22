import { printTree } from '@/utils/codemirror';

import { parser } from './parser';

const testData = [
  ['', '[Text]'],
  ['тест русский', '[Text[Filler]]'],
  ['test english', '[Text[Filler]]'],
  ['test greek σσσ', '[Text[Filler]]'],
  ['X1 раз два X2', '[Text[Filler]]'],
  ['{{variable}}', '[Text[Variable]]'],
  ['{{var_1}}', '[Text[Variable]]'],
  ['{{user.name}}', '[Text[Variable]]'],
  ['!error!', '[Text[Error]]'],
  ['word !error! word', '[Text[Filler][Error][Filler]]'],
  ['{{variable}} !error! word', '[Text[Variable][Error][Filler]]'],
  ['word {{variable}}', '[Text[Filler][Variable]]'],
  ['word {{variable}} !error!', '[Text[Filler][Variable][Error]]'],
  ['{{variable}} word', '[Text[Variable][Filler]]'],
  ['!err! {{variable}}', '[Text[Error][Variable]]'],
  ['!err! {{variable}} word', '[Text[Error][Variable][Filler]]']
] as const;

/** Test prompt grammar parser with various prompt inputs */
describe('Prompt grammar parser', () => {
  it.each(testData)('Parse %p', (input: string, expectedTree: string) => {
    const tree = parser.parse(input);
    expect(printTree(tree)).toBe(expectedTree);
  });
});
