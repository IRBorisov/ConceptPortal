const CYRILLIC_LETTER = /^[А-Яа-яЁё]+$/u;
const CYRILLIC_VOWEL = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/u;
const CYRILLIC_CONSONANT = /[бвгджзйклмнпрстфхцчшщБВГДЖЗЙКЛМНПРСТФХЦЧШЩ]/u;
const SHORT_RUSSIAN_WORD = /(^|[\s([{"'«])([АаВвИиКкОоСсУуЯя])\s+(?=[А-Яа-яЁё])/gu;

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

/**
 * Inserts NBSP after short Russian function words (`и`, `в`, `к`, …) so `@react-pdf` does not
 * wrap them onto a line by themselves.
 */
export function protectShortRussianWords(text: string): string {
  return text.replace(SHORT_RUSSIAN_WORD, `$1$2\u00A0`);
}

/**
 * Formats `pageNumber / totalPages` for `@react-pdf` `Text` `render` callbacks.
 *
 * During layout, react-pdf may call the callback with placeholder values (`-1`, `0`,
 * `totalPages + 1`). Those must not be written into the finished PDF — this helper returns `''`
 * for any invalid combination.
 *
 * @returns `"N / M"` for valid 1-based indices, otherwise an empty string
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
 * Hyphenation callback for Cyrillic words in `@react-pdf` `Text`.
 *
 * Returns syllable-like break segments of length ≥ 2, or `[word]` when the token is too short /
 * non-Cyrillic. Pass as `hyphenationCallback={hyphenateCyrillic}`.
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
