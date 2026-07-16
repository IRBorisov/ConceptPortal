const CYRILLIC_LETTER = /^[А-Яа-яЁё]+$/u;
const CYRILLIC_VOWEL = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/u;
const CYRILLIC_CONSONANT = /[бвгджзйклмнпрстфхцчшщБВГДЖЗЙКЛМНПРСТФХЦЧШЩ]/u;
const SHORT_RUSSIAN_WORD = /(^|[\s([{"'«])([АаВвИиКкОоСсУуЯя])\s+(?=[А-Яа-яЁё])/gu;
/**
 * `@react-pdf` / textkit only wraps on ASCII spaces or hyphenation syllables (which draw `-`).
 * `U+200B` is ignored, so long URLs must use real line breaks.
 */
const HARD_WRAP = '\n';
/** Prefer wrapping URLs/paths after these (not mid-hostname dots). */
const PREFERRED_WRAP_AFTER = /[/:?&=#_]/;
const SECONDARY_WRAP_AFTER = /[.\-%~,;@+]/;
/** Prefer a wrap once a token has this many characters since the last break. */
const WRAP_TARGET_CHARS = 20;
/** Allow a weaker punctuation wrap (e.g. `.`) after this many characters. */
const WRAP_SECONDARY_CHARS = 28;
/** Force a wrap even mid-token if no punctuation appeared by this length. */
const WRAP_FORCE_CHARS = 34;
/** Tokens shorter than this are left alone. */
const LONG_TOKEN_MIN = 16;

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
 * Inserts hard line breaks into long unbroken tokens (URLs, paths, IDs).
 *
 * `@react-pdf` 4.x does not wrap on zero-width spaces and draws a visible `-` for hyphenation
 * syllables, so long Latin tokens would otherwise clip past the cell border. Breaks prefer
 * punctuation (`/`, `?`, `&`, …) near {@link WRAP_TARGET_CHARS}, and fall back to a forced
 * break by {@link WRAP_FORCE_CHARS}.
 */
export function insertSoftWraps(text: string): string {
  if (!text) {
    return text;
  }

  return text
    .split(/(\s+)/)
    .map(segment => {
      if (!segment || /^\s+$/.test(segment) || segment.length < LONG_TOKEN_MIN) {
        return segment;
      }
      return hardWrapLongToken(segment);
    })
    .join('');
}

function hardWrapLongToken(token: string): string {
  let result = '';
  let sinceBreak = 0;

  for (let index = 0; index < token.length; index += 1) {
    const char = token[index];
    result += char;
    sinceBreak += 1;

    if (index >= token.length - 1) {
      continue;
    }

    if (PREFERRED_WRAP_AFTER.test(char) && sinceBreak >= WRAP_TARGET_CHARS) {
      result += HARD_WRAP;
      sinceBreak = 0;
      continue;
    }

    if (SECONDARY_WRAP_AFTER.test(char) && sinceBreak >= WRAP_SECONDARY_CHARS) {
      result += HARD_WRAP;
      sinceBreak = 0;
      continue;
    }

    if (sinceBreak >= WRAP_FORCE_CHARS) {
      result += HARD_WRAP;
      sinceBreak = 0;
    }
  }

  return result;
}

/**
 * Prepares natural-language PDF cell text: keep short Russian words glued, allow long URLs to wrap.
 */
export function preparePdfProse(text: string): string {
  return insertSoftWraps(protectShortRussianWords(text));
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
 * non-Cyrillic. Pass as `hyphenationCallback={hyphenateCyrillic}`. Long Latin tokens (URLs) must
 * use {@link insertSoftWraps} / {@link preparePdfProse} — hyphenation would draw a visible `-`.
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
