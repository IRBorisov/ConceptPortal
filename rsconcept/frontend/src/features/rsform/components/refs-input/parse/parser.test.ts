import { describe, expect, it } from 'vitest';

import { printTree } from '@rsconcept/domain/parsing';

import { parser } from './parser';

const testData = [
  ['', '[Text]'],
  ['тест русский', '[Text[Filler]]'],
  ['test english', '[Text[Filler]]'],
  ['test greek σσσ', '[Text[Filler]]'],
  ['X1 раз два X2', '[Text[Filler]]'],

  ['@{1| черный }', '[Text[RefSyntactic[Offset][Nominal]]]'],
  ['@{-1| черный }', '[Text[RefSyntactic[Offset][Nominal]]]'],
  ['@{-100| черный слон }', '[Text[RefSyntactic[Offset][Nominal]]]'],
  ['@{X1|VERB,past,sing}', '[Text[RefEntity[Global][Grams]]]'],
  ['@{X12|VERB,past,sing}', '[Text[RefEntity[Global][Grams]]]'],
  ['@{A55|sing,datv}', '[Text[RefEntity[Global][Grams]]]'],
  // Cyrillic А (U+0410) is not a Global prefix; Lezer error-recovers as RefSyntactic
  ['@{А55|sing,datv}', '[Text[RefSyntactic[⚠][Offset][Nominal]]]']
] as const;

describe('Testing NaturalParser', () => {
  testData.forEach(([input, expectedTree]) => {
    it(`Parse "${input}"`, () => {
      // NOTE: use strict parser to determine exact error position
      // const tree = parser.configure({strict: true}).parse(input);
      const tree = parser.parse(input);
      expect(printTree(tree)).toBe(expectedTree);
    });
  });
});
