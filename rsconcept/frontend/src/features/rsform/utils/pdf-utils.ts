export function addSpacesTypification(text: string): string {
  let result = text.replace(/([^\s\d])(?=[^0-9\s])/g, '$1\u200B');
  result = result.replace(/([\(\×])/g, '$1\u200B');
  return result;
}

export function addSpaces(text: string): string {
  return text.replace(/(?![A-Za-z])([^\s])/g, '$1\u200B');
}

/**
 * Allows @react-pdf to properly break long Cyrillic words using hyphenation points.
 * For non-Cyrillic words, returns the word as a whole.
 * This implementation breaks Cyrillic after vowels or soft/hard sign followed by a consonant,
 * which is a crude but improved approach over one-char splits.
 */
export function hyphenateCyrillic(word: string): string[] {
  // Only hyphenate if word contains Cyrillic
  if (!/[А-Яа-яЁё]/.test(word)) {
    return [word];
  }
  // Simple heuristic: break after vowels, soft sign, or hard sign when followed by consonant
  const cyrillicVowel = '[аеёиоуыэюяАЕЁИОУЫЭЮЯ]';
  const cyrillicConsonant = '[бвгджзйклмнпрстфхцчшщБВГДЖЗЙКЛМНПРСТФХЦЧШЩ]';
  // Break after vowels or (soft/hard sign) if followed by a consonant
  const re = new RegExp(`((?:${cyrillicVowel}|[ьЬъЪ])(?=${cyrillicConsonant}))`, 'gu');
  // Insert hyphens (split points) using a zero-width placeholder, then split there.
  const PLACEHOLDER = '\u200B';
  const res = word.replace(re, '$1' + PLACEHOLDER).split(PLACEHOLDER);
  return res;
}
