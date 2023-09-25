import { printTree } from '../../../utils/print-lezer-tree';
import { parser } from './parser';

const testData = [
  ['', '[Text]'],
  ['тест русский', '[Text[Word][Word]]'],
  ['test english', '[Text[Word][Word]]'],
  ['test greek σσσ', '[Text[Word][Word][Word]]'],
  ['X1 раз два X2', '[Text[Word][Word][Word][Word]]'],

  ['@{1| черный }', '[Text[RefSyntactic[Offset][Nominal[Word]]]]'],
  ['@{-1| черный }', '[Text[RefSyntactic[Offset][Nominal[Word]]]]'],
  ['@{-100| черный слон }', '[Text[RefSyntactic[Offset][Nominal[Word][Word]]]]'],
  ['@{X1|VERB,past,sing}', '[Text[RefEntity[Global][Gram][Gram][Gram]]]'],
  ['@{X12|VERB,past,sing}', '[Text[RefEntity[Global][Gram][Gram][Gram]]]'],
];

describe('Testing NaturalParser', () => {
  it.each(testData)('Parse %p', 
  (input: string, expectedTree: string) => {
    // NOTE: use strict parser to determine exact error position
    // const tree = parser.configure({strict: true}).parse(input);
    const tree = parser.parse(input);
    expect(printTree(tree)).toBe(expectedTree);
  });
});
