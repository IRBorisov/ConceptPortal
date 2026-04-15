import { describe, expect, it } from 'vitest';

import { RSLangAnalyzer } from '../index';

import { generateExpressionFromAst } from './expression-generator';

const analyzer = new RSLangAnalyzer();

function parseAst(expression: string) {
  const ast = analyzer.checkFast(expression).ast;
  if (!ast) {
    throw new Error(`Failed to parse expression: ${expression}`);
  }
  return ast;
}

const testNormalized = [
  // Predicates
  ['1 = 2', '1=2'],
  ['1 < X1', '1<X1'],
  ['1 > 2', '1>2'],
  ['1 < 2', '1<2'],
  ['X1 ≠ a', 'X1≠a1'],
  ['P1[a,b]', 'P1[a1, a2]'],
  // Logic operators
  ['¬1=2', '¬(1=2)'],
  ['1=1 & 2=2 & 3=3', '1=1 & 2=2 & 3=3'],
  ['1=1 & (2=2 & 3=3)', '1=1 & 2=2 & 3=3'],
  ['(1=1 & 2=2) & 3=3', '1=1 & 2=2 & 3=3'],
  ['1=1 ∨ 2=2 ∨ 3=3', '1=1 ∨ 2=2 ∨ 3=3'],
  ['1=1 ⇒ 2=2 ⇒ 3=3', '1=1 ⇒ 2=2 ⇒ 3=3'],
  ['(1=1 ⇒ 2=2) ⇒ 3=3', '1=1 ⇒ 2=2 ⇒ 3=3'],
  ['1=1 ⇒ (2=2 ⇒ 3=3)', '1=1 ⇒ (2=2 ⇒ 3=3)'],
  ['1=1 ⇔ 2=2 ⇔ 3=3', '1=1 ⇔ 2=2 ⇔ 3=3'],
  ['(1=1 ∨ 2=2) & 3=3', '(1=1 ∨ 2=2) & 3=3'],
  // Quantifiers
  ['∀a∈X1 1=1', '∀a1∈X1 1=1'],
  ['∃a∈X1 1=1', '∃a1∈X1 1=1'],
  ['∀a∈X1 ∃b∈X1 1=1 & 2=2', '∀a1∈X1 ∃a2∈X1 1=1 & 2=2'],
  ['∀a∈X1 1=1 & 2=2', '∀a1∈X1 1=1 & 2=2'],
  ['∀a∈X1 (1=1 & 2=2)', '∀a1∈X1 (1=1 & 2=2)'],
  ['∀a∈X1 (a=a & a=a)', '∀a1∈X1 (a1=a1 & a1=a1)'],
  ['∀a,b∈X1 1=2', '∀a1, a2∈X1 1=2'],
  ['∀(a,b),(c,d)∈S1 1=2', '∀(a1, a2), (a3, a4)∈S1 1=2'],
  // Setexpr operators
  ['1+2+3', '(1+2)+3'],
  ['((a ∪ b) ∩ (c \\ d)) ∆ (e × f)', '((a1∪a2)∩(a3\\a4))∆(a5×a6)'],
  // Function calls / text functions
  ['card(X1)', 'card(X1)'],
  ['card(1)', 'card(1)'],
  ['card(a)', 'card(a1)'],
  ['Pr2(a)', 'Pr2(a1)'],
  ['bool(a)', 'bool(a1)'],
  ['debool(a)', 'debool(a1)'],
  ['red(a)', 'red(a1)'],
  ['Fi1,2[b](a)', 'Fi1,2[a1](a2)'],
  ['F1[a]', 'F1[a1]'],
  ['F1[a,b]', 'F1[a1, a2]'],
  ['F1[{(a,b)}]', 'F1[{(a1, a2)}]'],
  // Tuple & Set constructors
  ['(a,b,c)', '(a1, a2, a3)'],
  ['{a,b,c}', '{a1, a2, a3}'],
  ['{a}', '{a1}'],
  ['{(a,b)}', '{(a1, a2)}'],
  ['{(a,b),(b,c)}', '{(a1, a2), (a2, a3)}'],
  ['{{a, b}, {c, d}}', '{{a1, a2}, {a3, a4}}'],
  ['ℬ(a)', 'ℬ(a1)'],
  ['ℬℬ(a)', 'ℬℬ(a1)'],
  ['a×b×c', 'a1×a2×a3'],
  ['a×(b×c)', 'a1×(a2×a3)'],
  // Term constructors
  ['D{a∈X1 | 1=2}', 'D{a1∈X1 | 1=2}'],
  ['{a∈X1 | 1=2}', 'D{a1∈X1 | 1=2}'],
  ['D{(a,b)∈X1 | 1=2}', 'D{(a1, a2)∈X1 | 1=2}'],
  ['R{a:=S1 | card(a)<10 | a \\ a}', 'R{a1:=S1 | card(a1)<10 | a1\\a1}'],
  ['R{a:=S1 | a \\ a}', 'R{a1:=S1 | a1\\a1}'],
  ['R{(a,b):=S1 | (a \\ a, b)}', 'R{(a1, a2):=S1 | (a1\\a1, a2)}'],
  ['I{(a, b) | a:∈X1; b:=a}', 'I{(a1, a2) | a1:∈X1; a2:=a1}'],
  ['I{(a, b) | (a,b):∈Z×Z}', 'I{(a1, a2) | (a1, a2):∈Z×Z}'],
  ['I{(a, b) | a:∈X1; b:=a; (a,b) ∈ S1}', 'I{(a1, a2) | a1:∈X1; a2:=a1; (a1, a2)∈S1}'],
  // Functions
  ['[σ∈ℬ((R1×R1)×R1)] ∀((α1,α2),γ)∈σ ((α2,α1),γ)∈σ', '[a1∈ℬ((R1×R1)×R1)] ∀((a2, a3), a4)∈a1 ((a3, a2), a4)∈a1']
];

describe('Testing AST expression generator', () => {
  testNormalized.forEach(([input, normalized]) => {
    it(`Normalize "${input}"`, () => {
      expect(generateExpressionFromAst(parseAst(input), { normalize: true })).toBe(normalized);
    });
  });

  it('normalizes local names consistently across declarations and usage', () => {
    const expression = '[a∈X1, b∈X1] a=b';
    expect(generateExpressionFromAst(parseAst(expression), { normalize: true })).toBe('[a1∈X1, a2∈X1] a1=a2');
  });

  it('normalizes radical names when requested', () => {
    expect(generateExpressionFromAst(parseAst('R7=R3'), { normalize: true })).toBe('R1=R2');
  });
});
