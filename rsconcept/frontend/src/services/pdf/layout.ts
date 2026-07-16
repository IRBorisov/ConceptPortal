/**
 * Heuristic layout helpers for deciding whether a PDF table row may wrap across pages.
 *
 * `@react-pdf` can hang or clip when a non-wrapping row is taller than the page. These estimators
 * use the same landscape A4 metrics as `PdfDocument` / `pdfs` (11pt body, cell padding) so callers
 * can set `wrap` only when a cell is expected to exceed one page.
 */

const MM_TO_PT = 2.834645669;
const PDF_TABLE_FONT_SIZE_PT = 11;
const PDF_CELL_PADDING_H_PT = 8;
const PDF_CELL_PADDING_V_PT = 6;
const PDF_LINE_HEIGHT_PT = 14;
/** Usable cell height: A4 landscape (210mm) minus page padding, footer, and table header. */
const PDF_SINGLE_CELL_MAX_HEIGHT_PT = (210 - 40 - 15 - 8) * MM_TO_PT - PDF_CELL_PADDING_V_PT;

/**
 * Input for estimating wrapped height of one table cell.
 *
 * Used by {@link pdfRowNeedsMultiPageWrap} before rendering; not a react-pdf node.
 */
export interface PdfCellLayoutEstimate {
  /** Cell text as it will appear after any spacing / NBSP preprocessing. */
  text: string;
  /** Column width in millimetres (must match the `width` style on the cell). */
  columnWidthMm: number;
  /**
   * Average glyph width as a fraction of font size.
   * Higher values mean wider characters (e.g. monospace / math). Default `0.55` for body text.
   */
  avgCharWidthRatio?: number;
}

function estimateParagraphLines(paragraph: string, charsPerLine: number): number {
  if (!paragraph) {
    return 1;
  }

  const tokens = paragraph.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return 1;
  }

  let lines = 1;
  let currentLineLength = 0;

  for (const token of tokens) {
    if (token.length > charsPerLine) {
      if (currentLineLength > 0) {
        lines += 1;
        currentLineLength = 0;
      }
      lines += Math.ceil(token.length / charsPerLine) - 1;
      currentLineLength = token.length % charsPerLine || charsPerLine;
      continue;
    }

    const nextLength = currentLineLength === 0 ? token.length : currentLineLength + 1 + token.length;
    if (nextLength > charsPerLine) {
      lines += 1;
      currentLineLength = token.length;
      continue;
    }

    currentLineLength = nextLength;
  }

  return lines;
}

/**
 * Estimates how many wrapped lines a cell needs at 11pt with the given column width.
 *
 * Newlines start new paragraphs; long tokens without spaces are hard-broken by character count.
 *
 * @returns At least `1` even for empty text
 */
export function estimatePdfCellLines(text: string, columnWidthMm: number, avgCharWidthRatio = 0.55): number {
  if (!text) {
    return 1;
  }

  const innerWidthPt = columnWidthMm * MM_TO_PT - PDF_CELL_PADDING_H_PT;
  const charsPerLine = Math.max(6, Math.floor(innerWidthPt / (PDF_TABLE_FONT_SIZE_PT * avgCharWidthRatio)));
  const paragraphLines = text.split('\n').reduce((total, paragraph) => {
    return total + estimateParagraphLines(paragraph, charsPerLine);
  }, 0);

  return Math.max(1, paragraphLines);
}

/**
 * Whether an estimated line count would exceed the usable height of one landscape page cell.
 *
 * @param lineCount - Typically from {@link estimatePdfCellLines}
 */
export function pdfCellExceedsSinglePageHeight(lineCount: number): boolean {
  return PDF_CELL_PADDING_V_PT + lineCount * PDF_LINE_HEIGHT_PT > PDF_SINGLE_CELL_MAX_HEIGHT_PT;
}

/**
 * Whether any cell in a row is tall enough that the row must allow multi-page `wrap`.
 *
 * Prefer keeping `wrap={false}` for short rows (better pagination performance); enable wrap only
 * when this returns `true`.
 */
export function pdfRowNeedsMultiPageWrap(cells: PdfCellLayoutEstimate[]): boolean {
  return cells.some(cell => {
    const lines = estimatePdfCellLines(cell.text, cell.columnWidthMm, cell.avgCharWidthRatio);
    return pdfCellExceedsSinglePageHeight(lines);
  });
}
