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
 * Gives @react-pdf conservative hyphenation points for Cyrillic words.
 */
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
