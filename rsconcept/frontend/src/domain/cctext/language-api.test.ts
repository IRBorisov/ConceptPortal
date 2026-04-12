import { describe, expect, it } from 'vitest';

import { Case, Grammeme, NounGrams, Plurality, VerbGrams } from './language';
import {
  getCompatibleGrams,
  grammemeCompare,
  parseEntityReference,
  parseGrammemes,
  parseSyntacticReference,
  wordFormEquals
} from './language-api';

describe('Testing wordform equality', () => {
  it('empty input', () => {
    expect(wordFormEquals({ text: '', grams: [] }, { text: '', grams: [] })).toEqual(true);
    expect(wordFormEquals({ text: '', grams: [] }, { text: '11', grams: [] })).toEqual(true);
    expect(wordFormEquals({ text: '11', grams: [] }, { text: '', grams: [] })).toEqual(true);
    expect(wordFormEquals({ text: '11', grams: [] }, { text: '42', grams: [] })).toEqual(true);
    expect(wordFormEquals({ text: '', grams: ['nomn'] }, { text: '', grams: [] })).toEqual(false);
    expect(wordFormEquals({ text: '11', grams: ['nomn'] }, { text: '11', grams: [] })).toEqual(false);
    expect(wordFormEquals({ text: '', grams: [] }, { text: '', grams: ['nomn'] })).toEqual(false);
    expect(wordFormEquals({ text: '11', grams: [] }, { text: '11', grams: ['nomn'] })).toEqual(false);
  });

  it('regular grammemes', () => {
    expect(wordFormEquals({ text: '', grams: ['nomn'] }, { text: '', grams: ['nomn'] })).toEqual(true);
    expect(wordFormEquals({ text: '', grams: ['nomn'] }, { text: '', grams: ['sing'] })).toEqual(false);
    expect(wordFormEquals({ text: '', grams: ['nomn', 'sing'] }, { text: '', grams: ['nomn', 'sing'] })).toEqual(true);
    expect(wordFormEquals({ text: '', grams: ['nomn', 'sing'] }, { text: '11', grams: ['nomn', 'sing'] })).toEqual(
      true
    );
    expect(wordFormEquals({ text: '11', grams: ['nomn', 'sing'] }, { text: '', grams: ['nomn', 'sing'] })).toEqual(
      true
    );
    expect(wordFormEquals({ text: '11', grams: ['nomn', 'sing'] }, { text: '11', grams: ['nomn', 'sing'] })).toEqual(
      true
    );
    expect(wordFormEquals({ text: '42', grams: ['nomn', 'sing'] }, { text: '11', grams: ['nomn', 'sing'] })).toEqual(
      true
    );
    expect(wordFormEquals({ text: '', grams: ['nomn', 'sing'] }, { text: '', grams: ['sing', 'nomn'] })).toEqual(false);
    expect(wordFormEquals({ text: '', grams: ['nomn', 'sing'] }, { text: '', grams: ['nomn'] })).toEqual(false);
    expect(wordFormEquals({ text: '', grams: ['nomn', 'nomn'] }, { text: '', grams: ['nomn'] })).toEqual(false);
  });
});

describe('Testing grammeme ordering', () => {
  it('regular grammemes', () => {
    expect(grammemeCompare('NOUN', 'NOUN')).toEqual(0);
    expect(grammemeCompare('NOUN', Grammeme.NOUN)).toEqual(0);

    expect(grammemeCompare(Grammeme.sing, Grammeme.plur)).toBeLessThan(0);
    expect(grammemeCompare('sing', 'plur')).toBeLessThan(0);
    expect(grammemeCompare('plur', 'sing')).toBeGreaterThan(0);

    expect(grammemeCompare('NOUN', 'ADJF')).toBeLessThan(0);
    expect(grammemeCompare('ADJF', 'NOUN')).toBeGreaterThan(0);
    expect(grammemeCompare('ADJS', 'NOUN')).toBeGreaterThan(0);
    expect(grammemeCompare('ADJS', 'ADJF')).toBeGreaterThan(0);

    expect(grammemeCompare('loct', 'ablt')).toBeGreaterThan(0);
    expect(grammemeCompare('ablt', 'accs')).toBeGreaterThan(0);
    expect(grammemeCompare('accs', 'datv')).toBeGreaterThan(0);
    expect(grammemeCompare('datv', 'gent')).toBeGreaterThan(0);
    expect(grammemeCompare('gent', 'nomn')).toBeGreaterThan(0);
  });
});

describe('Testing grammeme parsing', () => {
  it('empty input', () => {
    expect(parseGrammemes('')).toStrictEqual([]);
    expect(parseGrammemes(' ')).toStrictEqual([]);
    expect(parseGrammemes(' , ')).toStrictEqual([]);
  });

  it('regular grammemes', () => {
    expect(parseGrammemes('NOUN')).toStrictEqual([Grammeme.NOUN]);
    expect(parseGrammemes('sing,nomn')).toStrictEqual([Grammeme.sing, Grammeme.nomn]);
    expect(parseGrammemes('nomn,sing')).toStrictEqual([Grammeme.sing, Grammeme.nomn]);
  });

  it('custom grammemes', () => {
    expect(parseGrammemes('nomn,invalid,sing')).toStrictEqual([Grammeme.sing, Grammeme.nomn, 'invalid']);
    expect(parseGrammemes('invalid,test')).toStrictEqual(['invalid', 'test']);
  });
});

describe('Testing grammeme compatibility', () => {
  it('empty input', () => {
    expect(getCompatibleGrams([])).toStrictEqual([...VerbGrams, ...NounGrams]);
  });

  it('regular grammemes', () => {
    expect(getCompatibleGrams([Grammeme.NOUN])).toStrictEqual([...Case, ...Plurality]);
  });
});

describe('Testing reference parsing', () => {
  it('entity reference', () => {
    expect(parseEntityReference('@{ X1 | NOUN,sing }')).toStrictEqual({ entity: 'X1', form: 'NOUN,sing' });
    expect(parseEntityReference('@{X1|NOUN,sing}')).toStrictEqual({ entity: 'X1', form: 'NOUN,sing' });
    expect(parseEntityReference('@{X111|NOUN,sing}')).toStrictEqual({ entity: 'X111', form: 'NOUN,sing' });
  });

  it('syntactic reference', () => {
    expect(parseSyntacticReference('@{1|test test}')).toStrictEqual({ offset: 1, nominal: 'test test' });
    expect(parseSyntacticReference('@{101|test test}')).toStrictEqual({ offset: 101, nominal: 'test test' });
    expect(parseSyntacticReference('@{-1|test test}')).toStrictEqual({ offset: -1, nominal: 'test test' });
    expect(parseSyntacticReference('@{-99|test test}')).toStrictEqual({ offset: -99, nominal: 'test test' });
  });
});
