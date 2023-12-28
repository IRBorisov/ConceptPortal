import { extractGlobals, splitTemplateDefinition } from './rslangAPI';

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
