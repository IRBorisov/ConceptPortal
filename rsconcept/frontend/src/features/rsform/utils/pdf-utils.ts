const FORMAL_BINARY_OPERATOR = /([=≠<>≤≥∈∉⊂⊆⊃⊇∪∩∆+\-×\\|&∨∧⇒⇔→↔])/gu;
const FORMAL_PUNCTUATION = /([,;:])/gu;
const FORMAL_BOUNDARY = /([\]\)\}])(?=[\p{L}∀∃ℬ])/gu;
const FORMAL_OPEN_DELIMITER = /([\[\(\{])/gu;
const FORMAL_CLOSE_DELIMITER = /([\]\)\}])/gu;
const FORMAL_FUNCTION_CALL = /([\p{L}\p{N}ℬ]+)(?=[\[\(])/gu;

const CYRILLIC_LETTER = /^[А-Яа-яЁё]+$/u;
const CYRILLIC_VOWEL = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/u;
const CYRILLIC_CONSONANT = /[бвгджзйклмнпрстфхцчшщБВГДЖЗЙКЛМНПРСТФХЦЧШЩ]/u;
const SHORT_RUSSIAN_WORD = /(^|[\s([{"'«])([АаВвИиКкОоСсУуЯя])\s+(?=[А-Яа-яЁё])/gu;
const SOFT_BREAK = '\u200B';

function normalizeFormalSpacing(text: string): string {
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(FORMAL_PUNCTUATION, '$1 ')
    .replace(FORMAL_BINARY_OPERATOR, ' $1 ')
    .replace(FORMAL_BOUNDARY, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized
    .replace(FORMAL_FUNCTION_CALL, `$1${SOFT_BREAK}`)
    .replace(FORMAL_OPEN_DELIMITER, `$1${SOFT_BREAK}`)
    .replace(FORMAL_PUNCTUATION, `$1${SOFT_BREAK} `)
    .replace(FORMAL_BINARY_OPERATOR, ` ${SOFT_BREAK}$1${SOFT_BREAK} `)
    .replace(FORMAL_CLOSE_DELIMITER, `${SOFT_BREAK}$1`)
    .replace(/ {2,}/g, ' ');
}

function splitAtPositions(word: string, positions: number[]): string[] {
  const result: string[] = [];
  let start = 0;

  for (const position of positions) {
    result.push(word.slice(start, position));
    start = position;
  }

  result.push(word.slice(start));
  return result.filter(Boolean);
}

export function addSpacesTypification(text: string): string {
  return normalizeFormalSpacing(text);
}

export function addSpaces(text: string): string {
  return normalizeFormalSpacing(text);
}

export function protectShortRussianWords(text: string): string {
  return text.replace(SHORT_RUSSIAN_WORD, `$1$2\u00A0`);
}

/**
 * Formats a page range for @react-pdf Text `render` callbacks.
 * react-pdf may invoke the callback with placeholder values (-1, 0, totalPages + 1)
 * during layout passes; those must not be written into the final PDF.
 */
export function formatPdfPageRange(pageNumber: number, totalPages: number): string {
  if (!Number.isFinite(pageNumber) || !Number.isFinite(totalPages)) {
    return '';
  }
  if (pageNumber < 1 || totalPages < 1 || pageNumber > totalPages) {
    return '';
  }
  return `${pageNumber} / ${totalPages}`;
}

/**
 * Gives @react-pdf conservative hyphenation points for Cyrillic words.
 */
const MM_TO_PT = 2.834645669;
const PDF_TABLE_FONT_SIZE_PT = 11;
const PDF_CELL_PADDING_H_PT = 8;
const PDF_CELL_PADDING_V_PT = 6;
const PDF_LINE_HEIGHT_PT = 14;
/** Matches A4 landscape page in `CDocument` minus vertical padding, footer, and table header. */
const PDF_SINGLE_CELL_MAX_HEIGHT_PT = (210 - 40 - 15 - 8) * MM_TO_PT - PDF_CELL_PADDING_V_PT;

export interface PdfCellLayoutEstimate {
  text: string;
  columnWidthMm: number;
  /** Average character width as a fraction of font size; higher means wider glyphs. */
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

/** Estimates wrapped line count for a PDF table cell at 11pt. */
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

/** True when a single cell is estimated to be taller than one PDF page can fit. */
export function pdfCellExceedsSinglePageHeight(lineCount: number): boolean {
  return PDF_CELL_PADDING_V_PT + lineCount * PDF_LINE_HEIGHT_PT > PDF_SINGLE_CELL_MAX_HEIGHT_PT;
}

/** True when any cell in a row must be allowed to span multiple pages. */
export function pdfRowNeedsMultiPageWrap(cells: PdfCellLayoutEstimate[]): boolean {
  return cells.some(cell => {
    const lines = estimatePdfCellLines(cell.text, cell.columnWidthMm, cell.avgCharWidthRatio);
    return pdfCellExceedsSinglePageHeight(lines);
  });
}

export function hyphenateCyrillic(word: string): string[] {
  if (!CYRILLIC_LETTER.test(word) || word.length < 6) {
    return [word];
  }

  const breakPositions: number[] = [];
  let segmentStart = 0;

  for (let idx = 2; idx < word.length - 1; idx += 1) {
    const previousChar = word[idx - 1];
    const currentChar = word[idx];
    const nextChar = word[idx + 1];
    const leftLength = idx - segmentStart;
    const rightLength = word.length - idx;

    if (leftLength < 2 || rightLength < 2) {
      continue;
    }

    if (!CYRILLIC_CONSONANT.test(currentChar) || !CYRILLIC_VOWEL.test(nextChar)) {
      continue;
    }

    if (!CYRILLIC_VOWEL.test(previousChar) && !CYRILLIC_CONSONANT.test(previousChar)) {
      continue;
    }

    breakPositions.push(idx);
    segmentStart = idx;
  }

  if (breakPositions.length === 0) {
    return [word];
  }

  return splitAtPositions(word, breakPositions);
}
