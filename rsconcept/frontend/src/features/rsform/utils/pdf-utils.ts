export function addSpacesTypification(text: string): string {
  let result = text.replace(/([^\s\d])(?=[^0-9\s])/g, '$1\u200B');
  result = result.replace(/([\(\×])/g, '$1\u200B');
  return result;
}

export function addSpaces(text: string): string {
  return text.replace(/(?![A-Za-z])([^\s])/g, '$1\u200B');
}

/**
 * Allows @react-pdf to break long Cyrillic words by returning one-char chunks.
 * Falls back to the default behavior for non-Cyrillic words.
 */
export function hyphenateCyrillic(word: string): string[] {
  return /[А-Яа-яЁё]/.test(word) ? word.split('') : [word];
}
