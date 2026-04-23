import { describe, expect, it } from 'vitest';

import { addSpaces, hyphenateCyrillic, protectShortRussianWords } from './pdf-utils';

describe('pdf-utils', () => {
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

  it('keeps short Russian service words with the following word', () => {
    expect(protectShortRussianWords('и индекс в области')).toBe('и\u00A0индекс в\u00A0области');
  });

  it('never returns one-letter fragments for Cyrillic hyphenation', () => {
    expect(hyphenateCyrillic('индексация').every(part => part.length >= 2)).toBe(true);
    expect(hyphenateCyrillic('область').every(part => part.length >= 2)).toBe(true);
  });
});
