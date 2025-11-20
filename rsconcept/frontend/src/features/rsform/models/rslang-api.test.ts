import { describe, expect, it } from 'vitest';

import { applyTypificationMapping, extractGlobals, isSimpleExpression, splitTemplateDefinition } from './rslang-api';

const globalsData: [string, string][] = [
  ['', ''],
  ['X1', 'X1'],
  ['X11 X1 X11', 'X11 X1'],
  ['∀α∈S1 ∀β∈F1[α] Pr1,1(β)∩β=∅', 'S1 F1']
];

describe('Testing extract globals', () => {
  globalsData.forEach(([input, expected]) => {
    it(`Extract globals "${input}"`, () => {
      const result = extractGlobals(input);
      expect([...result].join(' ')).toBe(expected);
    });
  });
});

const simpleExpressionData: [string, string][] = [
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
  simpleExpressionData.forEach(([input, expected]) => {
    it(`isSimpleExpression "${input}"`, () => {
      const result = isSimpleExpression(input);
      expect(String(result)).toBe(expected);
    });
  });
});

const splitData: [string, string][] = [
  ['', '||'],
  ['[α∈ℬ(R1)] α⊆red(σ)', 'α∈ℬ(R1)||α⊆red(σ)'],
  ['[α∈ℬ(R1)] α⊆red(σ) ', 'α∈ℬ(R1)||α⊆red(σ)'],
  [' [α∈ℬ(R1)] α⊆red(σ)', 'α∈ℬ(R1)||α⊆red(σ)'],
  ['[α∈ℬ(R1)]α⊆red(σ)', 'α∈ℬ(R1)||α⊆red(σ)'],
  ['[α∈ℬ(R1), σ∈ℬℬ(R1)] α⊆red(σ)', 'α∈ℬ(R1), σ∈ℬℬ(R1)||α⊆red(σ)']
];

describe('Testing split template', () => {
  splitData.forEach(([input, expected]) => {
    it(`Split "${input}"`, () => {
      const result = splitTemplateDefinition(input);
      expect(`${result.head}||${result.body}`).toBe(expected);
    });
  });
});

const typificationMappingData: [string, string, string, string][] = [
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
  typificationMappingData.forEach(([original, replacement, input, expected]) => {
    it(`Apply typification mapping: ${original} -> ${replacement} in "${input}"`, () => {
      const result = applyTypificationMapping(input, { [original]: replacement });
      expect(result).toBe(expected);
    });
  });
});
