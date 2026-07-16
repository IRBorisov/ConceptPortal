import { describe, expect, it } from 'vitest';

import {
  formatPdfPageRange,
  hyphenateCyrillic,
  insertSoftWraps,
  preparePdfProse,
  protectShortRussianWords
} from './text';

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

  it('hard-wraps long URLs at punctuation without inserting visible hyphens', () => {
    const url = 'https://portal.acconcept.ru/rsforms/862?tab=2&active=12345';
    const wrapped = insertSoftWraps(url);

    expect(wrapped.includes('\n')).toBe(true);
    expect(wrapped.replaceAll('\n', '')).toBe(url);
    expect(wrapped.split('\n').every(line => line.length <= 34)).toBe(true);
  });

  it('leaves short tokens unchanged', () => {
    expect(insertSoftWraps('short')).toBe('short');
    expect(insertSoftWraps('Взято из')).toBe('Взято из');
  });

  it('preparePdfProse keeps Russian glue and wraps URLs in mixed convention text', () => {
    const text = 'Взято из https://portal.acconcept.ru/rsforms/862?tab=2&active=1';
    const prepared = preparePdfProse(text);

    expect(prepared.replaceAll('\n', '').startsWith('Взято из https://')).toBe(true);
    expect(prepared).toContain('\n');
  });
});
