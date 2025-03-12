import { applyTypificationMapping, extractGlobals, isSimpleExpression, splitTemplateDefinition } from './rslang-api';

const globalsData = [
  ['', ''],
  ['X1', 'X1'],
  ['X11 X1 X11', 'X11 X1'],
  ['∀α∈S1 ∀β∈F1[α] Pr1,1(β)∩β=∅', 'S1 F1']
];
describe('Testing extract globals', () => {
  it.each(globalsData)('Extract globals %p', (input: string, expected: string) => {
    const result = extractGlobals(input);
    expect([...result].join(' ')).toBe(expected);
  });
});

const simpleExpressionData = [
  ['', 'true'],
  ['Pr1(S1)', 'true'],
  ['pr1(S1)', 'true'],
  ['red(S1)', 'true'],
  ['red(Pr1(F1[α,σ]))', 'true'],
  ['ℬℬ(X1)', 'false'],
  ['ℬ(X1)', 'false'],
  ['D{(α,β)∈D6×D6 | α≠β & α∩β≠∅}', 'false'],
  ['D{ξ ∈ X1 | (ξ,ξ)∈S1 }', 'false'],
  ['I{(β,α) | α:∈D2; σ:=F5[α]; β:∈σ}', 'false'],
  ['∀σ∈S1 (F1[σ]×F1[σ])∩D11=∅', 'false']
];
describe('Testing simple expression', () => {
  it.each(simpleExpressionData)('isSimpleExpression %p', (input: string, expected: string) => {
    const result = isSimpleExpression(input);
    expect(String(result)).toBe(expected);
  });
});

const splitData = [
  ['', '||'],
  ['[α∈ℬ(R1)] α⊆red(σ)', 'α∈ℬ(R1)||α⊆red(σ)'],
  ['[α∈ℬ(R1)] α⊆red(σ) ', 'α∈ℬ(R1)||α⊆red(σ)'],
  [' [α∈ℬ(R1)] α⊆red(σ)', 'α∈ℬ(R1)||α⊆red(σ)'],
  ['[α∈ℬ(R1)]α⊆red(σ)', 'α∈ℬ(R1)||α⊆red(σ)'],
  ['[α∈ℬ(R1), σ∈ℬℬ(R1)] α⊆red(σ)', 'α∈ℬ(R1), σ∈ℬℬ(R1)||α⊆red(σ)']
];
describe('Testing split template', () => {
  it.each(splitData)('Split %p', (input: string, expected: string) => {
    const result = splitTemplateDefinition(input);
    expect(`${result.head}||${result.body}`).toBe(expected);
  });
});

const typificationMappingData = [
  ['', '', '', ''],
  ['X1', 'X2', 'X1', 'X2'],
  ['X1', 'X2', 'ℬ(X1)', 'ℬ(X2)'],
  ['X1', 'X2', 'X1×X3', 'X2×X3'],
  ['X1', '(X1×X1)', 'X1', 'X1×X1'],
  ['X1', '(X1×X1)', 'ℬ(X1)', 'ℬ(X1×X1)'],
  ['X1', '(X1×X1)', 'ℬ(X1×X2)', 'ℬ((X1×X1)×X2)'],
  ['X1', 'ℬ(X3)', 'ℬ(X1)', 'ℬℬ(X3)'],
  ['X1', 'ℬ(X3)', 'ℬ(X1×X1)', 'ℬ(ℬ(X3)×ℬ(X3))']
];
describe('Testing typification mapping', () => {
  it.each(typificationMappingData)(
    'Apply typification mapping %p',
    (original: string, replacement: string, input: string, expected: string) => {
      const result = applyTypificationMapping(input, { [original]: replacement });
      expect(result).toBe(expected);
    }
  );
});
