import { describe, expect, it } from 'vitest';

import { formatPdfPageRange, hyphenateCyrillic, protectShortRussianWords } from './text';

describe('pdf text helpers', () => {
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
