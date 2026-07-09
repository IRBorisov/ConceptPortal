import { describe, expect, it } from 'vitest';

import { Grammeme } from './language';
import {
  applyEntityReferenceMapping,
  extractEntities,
  generateNominalLexeme,
  parseEntityReference,
  parseGrammemes,
  parseReference,
  parseSyntacticReference,
  resolveTextReferences,
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

describe('Testing grammeme parsing', () => {
  it('empty input', () => {
    expect(parseGrammemes('')).toStrictEqual([]);
    expect(parseGrammemes(' ')).toStrictEqual([]);
    expect(parseGrammemes(' , ')).toStrictEqual([]);
  });

  it('regular grammemes', () => {
    expect(parseGrammemes('sing,nomn')).toStrictEqual([Grammeme.sing, Grammeme.nomn]);
    expect(parseGrammemes('nomn,sing')).toStrictEqual([Grammeme.sing, Grammeme.nomn]);
  });

  it('custom grammemes', () => {
    expect(parseGrammemes('nomn,invalid,sing')).toStrictEqual([Grammeme.sing, Grammeme.nomn, 'invalid']);
    expect(parseGrammemes('invalid,test')).toStrictEqual(['invalid', 'test']);
  });
});

describe('Testing nominal lexeme generation', () => {
  it('generates every supported noun form with nominal text', () => {
    const response = generateNominalLexeme({ text: 'nominal concept' });

    expect(response.items).toStrictEqual([
      { text: 'nominal concept', grams: 'sing,nomn' },
      { text: 'nominal concept', grams: 'sing,gent' },
      { text: 'nominal concept', grams: 'sing,datv' },
      { text: 'nominal concept', grams: 'sing,accs' },
      { text: 'nominal concept', grams: 'sing,ablt' },
      { text: 'nominal concept', grams: 'sing,loct' },
      { text: 'nominal concept', grams: 'plur,nomn' },
      { text: 'nominal concept', grams: 'plur,gent' },
      { text: 'nominal concept', grams: 'plur,datv' },
      { text: 'nominal concept', grams: 'plur,accs' },
      { text: 'nominal concept', grams: 'plur,ablt' },
      { text: 'nominal concept', grams: 'plur,loct' }
    ]);
  });
});

describe('Testing reference parsing', () => {
  it('entity reference', () => {
    expect(parseEntityReference('@{ X1 | nomn,sing }')).toStrictEqual({ entity: 'X1', tags: ['sing', 'nomn'] });
    expect(parseEntityReference('@{X1|nomn,sing}')).toStrictEqual({ entity: 'X1', tags: ['sing', 'nomn'] });
    expect(parseEntityReference('@{X111|nomn,sing}')).toStrictEqual({ entity: 'X111', tags: ['sing', 'nomn'] });
  });

  it('syntactic reference', () => {
    expect(parseSyntacticReference('@{1|test test}')).toStrictEqual({ offset: 1, nominal: 'test test' });
    expect(parseSyntacticReference('@{101|test test}')).toStrictEqual({ offset: 101, nominal: 'test test' });
    expect(parseSyntacticReference('@{-1|test test}')).toStrictEqual({ offset: -1, nominal: 'test test' });
    expect(parseSyntacticReference('@{-99|test test}')).toStrictEqual({ offset: -99, nominal: 'test test' });
  });

  it('validated reference', () => {
    expect(parseReference('@{X1|nomn, sing}')).toStrictEqual({
      type: 'entity',
      data: { entity: 'X1', tags: ['sing', 'nomn'] }
    });
    expect(parseReference('@{-1|derived term}')).toStrictEqual({
      type: 'syntax',
      data: { offset: -1, nominal: 'derived term' }
    });
    expect(parseReference('@{0|derived term}')).toBeNull();
    expect(parseReference('@{-0|derived term}')).toBeNull();
    expect(parseReference('@{1|}')).toBeNull();
    // Cyrillic А (U+0410) is not a syntactic offset; treat as entity alias
    expect(parseReference('@{А55|sing,datv}')).toStrictEqual({
      type: 'entity',
      data: { entity: 'А55', tags: ['sing', 'datv'] }
    });
  });
});

describe('applyEntityReferenceMapping', () => {
  it('replaces entity aliases in terminological references', () => {
    expect(applyEntityReferenceMapping('@{X1|sing}', { X1: 'X3' })).toBe('@{X3|sing}');
    expect(applyEntityReferenceMapping('@{X1|sing} and @{X2|plur}', { X1: 'X3', X2: 'X4' })).toBe(
      '@{X3|sing} and @{X4|plur}'
    );
    expect(applyEntityReferenceMapping('', { X1: 'X3' })).toBe('');
    expect(applyEntityReferenceMapping('plain text', { X1: 'X3' })).toBe('plain text');
  });

  it('trims padded entity names when resolving aliases', () => {
    expect(applyEntityReferenceMapping('@{ X1 |sing}', { X1: 'X3' })).toBe('@{X3|sing}');
  });
});

describe('Testing reference resolution', () => {
  it('extracts entity references', () => {
    expect(extractEntities('@{X1|} and @{1|nominal} and @{X2|sing,gent} and @{X1|plur,nomn}')).toStrictEqual([
      'X1',
      'X2'
    ]);
  });

  it('resolves entity references using nominal and manual forms', () => {
    const context = {
      X1: {
        nominal: 'base term',
        forms: [{ text: 'manual plural', grams: [Grammeme.plur, Grammeme.nomn] }]
      }
    };

    expect(resolveTextReferences('Use @{X1|nomn,sing}.', context)).toBe('Use base term.');
    expect(resolveTextReferences('Use @{X1|plur,nomn}.', context)).toBe('Use manual plural.');
    expect(resolveTextReferences('Use @{X1|sing,gent}.', context)).toBe('Use base term.');
  });

  it('resolves syntactic references to nominal text without inflection', () => {
    const context = {
      X1: {
        nominal: 'base term'
      }
    };

    expect(resolveTextReferences('@{X1|nomn,sing} @{-1|derived term}', context)).toBe('base term derived term');
    expect(resolveTextReferences('@{1|derived term} @{X1|nomn,sing}', context)).toBe('derived term base term');
    expect(resolveTextReferences('@{-1|derived term}', context)).toBe('!Некорректное смещение: -1!');
  });
});
