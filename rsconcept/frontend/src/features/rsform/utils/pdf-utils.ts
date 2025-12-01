export function addSpaces(text: string): string {
  return text.replace(/(?![A-Za-z])([^\s])/g, '$1\u200B');
}
