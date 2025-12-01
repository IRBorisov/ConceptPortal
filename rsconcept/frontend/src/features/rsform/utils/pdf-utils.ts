export function addSpacesTypification(text: string): string {
  let result = text.replace(/([^\s\d])(?=[^0-9\s])/g, '$1\u200B');
  result = result.replace(/([\(\×])/g, '$1\u200B');
  return result;
}

export function addSpaces(text: string): string {
  return text.replace(/(?![A-Za-z])([^\s])/g, '$1\u200B');
}
