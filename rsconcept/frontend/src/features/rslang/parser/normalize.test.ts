import { describe, expect, it } from 'vitest';

import { buildTree, printAst } from '@/utils/parsing';

import { labelRSLangNode } from '../labels';

import { normalizeAST } from './normalize';
import { parser } from './parser';

const testData = [
  // Predicates
  ['1 = 2', '[=[1][2]]'],
  ['1 < X1', '[<[1][X1]]'],
  ['1 > 2', '[>[1][2]]'],
  ['1 < 2', '[<[1][2]]'],
  ['X1 ≠ a', '[≠[X1][a]]'],
  ['P1[a,b]', '[CALL[P1][a][b]]'],
  // Logic operators
  ['¬1=2', '[¬[=[1][2]]]'],
  ['1=1 & 2=2 & 3=3', '[&[&[=[1][1]][=[2][2]]][=[3][3]]]'],
  ['1=1 ∨ 2=2 ∨ 3=3', '[∨[∨[=[1][1]][=[2][2]]][=[3][3]]]'],
  ['1=1 ⇒ 2=2 ⇒ 3=3', '[⇒[⇒[=[1][1]][=[2][2]]][=[3][3]]]'],
  ['1=1 ⇔ 2=2 ⇔ 3=3', '[⇔[⇔[=[1][1]][=[2][2]]][=[3][3]]]'],
  ['(1=1 & 2=2) & 3=3', '[&[&[=[1][1]][=[2][2]]][=[3][3]]]'],
  ['1=1 & (2=2 & 3=3)', '[&[=[1][1]][&[=[2][2]][=[3][3]]]]'],
  ['1=1 ∨ 2=2 & 3=3', '[∨[=[1][1]][&[=[2][2]][=[3][3]]]]'],
  ['1=1 & 2=2 ∨ 3=3 ⇒ 4=4 ⇔ 5=5', '[⇔[⇒[∨[&[=[1][1]][=[2][2]]][=[3][3]]][=[4][4]]][=[5][5]]]'],
  // Quantifiers
  ['∀a∈X1 1=1', '[∀[a][X1][=[1][1]]]'],
  ['∃a∈X1 1=1', '[∃[a][X1][=[1][1]]]'],
  ['∀a∈X1 1=1 & 2=2', '[&[∀[a][X1][=[1][1]]][=[2][2]]]'],
  ['∀a∈X1 a=a & a=a', '[&[∀[a][X1][=[a][a]]][=[a][a]]]'],
  ['∀a,b∈X1 1=2', '[∀[ENUM_DECLARE[a][b]][X1][=[1][2]]]'],
  ['∀(a,b),(c,d)∈S1 1=2', '[∀[ENUM_DECLARE[TUPLE_DECLARE[a][b]][TUPLE_DECLARE[c][d]]][S1][=[1][2]]]'],
  // Setexpr operators
  ['1+2+3', '[+[+[1][2]][3]]'],
  ['(1+2)+3', '[+[+[1][2]][3]]'],
  ['1+(2+3)', '[+[1][+[2][3]]]'],
  ['1+2-3', '[-[+[1][2]][3]]'],
  ['1-2-3', '[-[-[1][2]][3]]'],
  ['1+(2-3)', '[+[1][-[2][3]]]'],
  ['1*(2+3)', '[*[1][+[2][3]]]'],
  ['1*2*3', '[*[*[1][2]][3]]'],
  ['a\\b\\c', '[\\[\\[a][b]][c]]'],
  ['(a\\b)\\c', '[\\[\\[a][b]][c]]'],
  ['a\\(b\\c)', '[\\[a][\\[b][c]]]'],
  ['((a ∪ b) ∩ (c \\ d)) ∆ (e × f)', '[∆[∩[∪[a][b]][\\[c][d]]][×[e][f]]]'],
  // Function calls / text functions
  ['card(X1)', '[card[X1]]'],
  ['card(1)', '[card[1]]'],
  ['card(a)', '[card[a]]'],
  ['card(∅)', '[card[∅]]'],
  ['card(Z)', '[card[Z]]'],
  ['Pr2(a)', '[Pr2[a]]'],
  ['bool(a)', '[bool[a]]'],
  ['debool(a)', '[debool[a]]'],
  ['red(a)', '[red[a]]'],
  ['Fi1,2[b](a)', '[Fi1,2[b][a]]'],
  ['F1[a]', '[CALL[F1][a]]'],
  ['F1[a,b]', '[CALL[F1][a][b]]'],
  ['F1[{(a,b)}]', '[CALL[F1][ENUM[TUPLE[a][b]]]]'],
  // Tuple & Set constructors
  ['(a,b,c)', '[TUPLE[a][b][c]]'],
  ['{a,b,c}', '[ENUM[a][b][c]]'],
  ['{a}', '[ENUM[a]]'],
  ['{(a,b)}', '[ENUM[TUPLE[a][b]]]'],
  ['{(a,b),(b,c)}', '[ENUM[TUPLE[a][b]][TUPLE[b][c]]]'],
  ['{{a, b}, {c, d}}', '[ENUM[ENUM[a][b]][ENUM[c][d]]]'],
  ['ℬ(a)', '[ℬ[a]]'],
  ['ℬℬ(a)', '[ℬ[ℬ[a]]]'],
  ['a×b×c', '[×[a][b][c]]'],
  ['a×(b×c)', '[×[a][×[b][c]]]'],
  // Term constructors
  ['D{a∈X1 | 1=2}', '[DECLARATIVE[a][X1][=[1][2]]]'],
  ['{a∈X1 | 1=2}', '[DECLARATIVE[a][X1][=[1][2]]]'],
  ['D{(a,b)∈X1 | 1=2}', '[DECLARATIVE[TUPLE_DECLARE[a][b]][X1][=[1][2]]]'],
  ['R{a:=S1 | card(a)<10 | a \\ a}', '[RECURSIVE[a][S1][<[card[a]][10]][\\[a][a]]]'],
  ['R{a:=S1 | a \\ a}', '[RECURSIVE[a][S1][\\[a][a]]]'],
  ['R{(a,b):=S1 | (a \\ a, b)}', '[RECURSIVE[TUPLE_DECLARE[a][b]][S1][TUPLE[\\[a][a]][b]]]'],
  ['I{(a, b) | a:∈X1; b:=a}', '[IMPERATIVE[TUPLE[a][b]][:∈[a][X1]][:=[b][a]]]'],
  ['I{(a, b) | (a,b):∈Z×Z}', '[IMPERATIVE[TUPLE[a][b]][:∈[TUPLE_DECLARE[a][b]][×[Z][Z]]]]'],
  ['I{(a, b) | a:∈X1; b:=a; (a,b) ∈ S1}', '[IMPERATIVE[TUPLE[a][b]][:∈[a][X1]][:=[b][a]][∈[TUPLE[a][b]][S1]]]']
];

// .filter(([input]) => input === 'I{(a, b) | (a,b):∈Z×Z}')
describe('Testing AST normalization', () => {
  testData.forEach(([input, expectedTree]) => {
    it(`Parse "${input}"`, () => {
      const tree = parser.configure({ strict: false }).parse(input);
      const ast = buildTree(tree.cursor());
      normalizeAST(ast, input);
      expect(printAst(ast, labelRSLangNode)).toBe(expectedTree);
    });
  });
});
