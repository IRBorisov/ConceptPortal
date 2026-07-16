import { describe, expect, it } from 'vitest';

import { addSpaces } from './formal-text';

describe('rsform formal PDF text', () => {
  it('keeps formal expression spacing readable after removing soft wrap points', () => {
    expect(addSpaces('[α∈ℬ(Z×Z)]debool(D{ξ∈F6[α]|∀σ∈F6[α]ξ≥σ})').replaceAll('\u200B', '')).toBe(
      '[α ∈ ℬ(Z × Z)] debool(D{ξ ∈ F6[α] | ∀σ ∈ F6[α] ξ ≥ σ})'
    );
  });

  it('adds invisible wrap points inside formal syntax groups', () => {
    const result = addSpaces('[α∈ℬ(R1)]Pr1(β)');

    expect(result).toContain('[\u200Bα');
    expect(result).toContain('Pr1\u200B(\u200Bβ');
  });
});
