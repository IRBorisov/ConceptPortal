/**
 * Spacing / soft-break helpers for RSLang formal strings in PDF table cells.
 *
 * Inserts readable spaces around operators and zero-width soft breaks (`U+200B`) at wrap-friendly
 * points inside delimiters and function calls so long formulas wrap without relying on hyphenation.
 */

const FORMAL_BINARY_OPERATOR = /([=≠<>≤≥∈∉⊂⊆⊃⊇∪∩∆+\-×\\|&∨∧⇒⇔→↔])/gu;
const FORMAL_PUNCTUATION = /([,;:])/gu;
const FORMAL_BOUNDARY = /([\]\)\}])(?=[\p{L}∀∃ℬ])/gu;
const FORMAL_OPEN_DELIMITER = /([\[\(\{])/gu;
const FORMAL_CLOSE_DELIMITER = /([\]\)\}])/gu;
const FORMAL_FUNCTION_CALL = /([\p{L}\p{N}ℬ]+)(?=[\[\(])/gu;
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

/**
 * Soft wrap points and spacing for a constituenta formal definition (`definition_formal`).
 *
 * Soft breaks are invisible; strip `\u200B` if you need the human-readable spaced form for tests.
 */
export function addSpaces(text: string): string {
  return normalizeFormalSpacing(text);
}

/**
 * Soft wrap points and spacing for a typification label (same rules as {@link addSpaces}).
 */
export function addSpacesTypification(text: string): string {
  return normalizeFormalSpacing(text);
}
