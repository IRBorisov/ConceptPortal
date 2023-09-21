import { Grammeme, parseGrammemes } from './language';


describe('Testing grammeme parsing', () => {
  test('empty input',
  () => {
    expect(parseGrammemes('').length).toBe(0);
    expect(parseGrammemes(' ').length).toBe(0);
    expect(parseGrammemes(' , ').length).toBe(0);
  });

  test('regular grammemes',
  () => {
    expect(parseGrammemes('NOUN')).toStrictEqual([{type: Grammeme.NOUN, data: 'NOUN'}]);
    expect(parseGrammemes('sing,nomn')).toStrictEqual([
      {type: Grammeme.sing, data: 'sing'},
      {type: Grammeme.nomn, data: 'nomn'}
    ]);
  });
});
