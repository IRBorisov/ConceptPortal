import { describe, expect, it } from 'vitest';

import { addSpaces, formatPdfPageRange, hyphenateCyrillic, protectShortRussianWords } from './pdf-utils';

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

  it('formats valid PDF page ranges', () => {
    expect(formatPdfPageRange(1, 3)).toBe('1 / 3');
    expect(formatPdfPageRange(3, 3)).toBe('3 / 3');
  });

  it('hides react-pdf layout placeholder page numbers', () => {
    expect(formatPdfPageRange(-1, 5)).toBe('');
    expect(formatPdfPageRange(0, 5)).toBe('');
    expect(formatPdfPageRange(6, 5)).toBe('');
    expect(formatPdfPageRange(1, 0)).toBe('');
    expect(formatPdfPageRange(Number.NaN, 2)).toBe('');
  });
});
