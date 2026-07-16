import { describe, expect, it } from 'vitest';

import { estimatePdfCellLines, pdfCellExceedsSinglePageHeight, pdfRowNeedsMultiPageWrap } from './layout';

describe('pdf layout helpers', () => {
  it('keeps normal text definitions on a single page row', () => {
    const text = 'Длинное текстовое описание конституенты для переноса на следующие страницы PDF-документа. '.repeat(4);

    expect(pdfRowNeedsMultiPageWrap([{ text, columnWidthMm: 82 }])).toBe(false);
  });

  it('allows row wrapping only when a cell exceeds one page', () => {
    const text = 'Длинное текстовое определение конституенты с подробным описанием смысла. '.repeat(120);

    expect(estimatePdfCellLines(text, 82)).toBeGreaterThan(30);
    expect(pdfCellExceedsSinglePageHeight(estimatePdfCellLines(text, 82))).toBe(true);
    expect(pdfRowNeedsMultiPageWrap([{ text, columnWidthMm: 82 }])).toBe(true);
  });
});
