import { Grammeme } from './language';
import { parseEntityReference, parseGrammemes, parseSyntacticReference } from './languageAPI';


describe('Testing grammeme parsing', () => {
  test('empty input',
  () => {
    expect(parseGrammemes('').length).toBe(0);
    expect(parseGrammemes(' ').length).toBe(0);
    expect(parseGrammemes(' , ').length).toBe(0);
  });

  test('regular grammemes',
  () => {
    expect(parseGrammemes('NOUN')).toStrictEqual([Grammeme.NOUN]);
    expect(parseGrammemes('sing,nomn')).toStrictEqual([Grammeme.sing, Grammeme.nomn]);
    expect(parseGrammemes('nomn,sing')).toStrictEqual([Grammeme.sing, Grammeme.nomn]);
    expect(parseGrammemes('nomn,invalid,sing')).toStrictEqual([Grammeme.sing, Grammeme.nomn, 'invalid']);
    expect(parseGrammemes('invalid,test')).toStrictEqual(['invalid', 'test']);
  });
});


describe('Testing reference parsing', () => {
  test('entity reference',
  () => {
    expect(parseEntityReference('@{ X1 | NOUN,sing }')).toStrictEqual({entity: 'X1', form: 'NOUN,sing'});
    expect(parseEntityReference('@{X1|NOUN,sing}')).toStrictEqual({entity: 'X1', form: 'NOUN,sing'});
    expect(parseEntityReference('@{X111|NOUN,sing}')).toStrictEqual({entity: 'X111', form: 'NOUN,sing'});
  });

  test('syntactic reference',
  () => {
    expect(parseSyntacticReference('@{1|test test}')).toStrictEqual({offset: 1, nominal: 'test test'});
    expect(parseSyntacticReference('@{101|test test}')).toStrictEqual({offset: 101, nominal: 'test test'});
    expect(parseSyntacticReference('@{-1|test test}')).toStrictEqual({offset: -1, nominal: 'test test'});
    expect(parseSyntacticReference('@{-99|test test}')).toStrictEqual({offset: -99, nominal: 'test test'});
  });
});
