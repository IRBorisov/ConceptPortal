/**
 * Module: Formatting utilities.
 */

/** Generate ISO timestamp. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Formats integer value to string with thousands separators. */
export function formatInteger(value: number | string): string {
  if (typeof value === 'number') {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
  }

  const match = /^(-?)(\d+)$/.exec(value);
  if (!match) {
    return value;
  }

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
}

/** Generate HTML wrapper for control description including hotkey. */
export function prepareTooltip(text: string, hotkey?: string) {
  return hotkey ? `<kbd>[${hotkey}]</kbd><br/>${text}` : text;
}

/** Remove HTML tags from target string. */
export function removeTags(target?: string): string {
  if (!target) {
    return '';
  }
  return target.toString().replace(/(<([^>]+)>)/gi, '');
}

/** Truncate text to max symbols. Add ellipsis if truncated. */
export function truncateToSymbol(text: string, maxSymbols: number): string {
  if (text.length <= maxSymbols) {
    return text;
  }
  const trimmedText = text.slice(0, maxSymbols);
  return trimmedText + '...';
}

/** Truncate text to last word up to max symbols. Add ellipsis if truncated. */
export function truncateToLastWord(text: string, maxSymbols: number): string {
  if (text.length <= maxSymbols) {
    return text;
  }
  const trimmedText = text.slice(0, maxSymbols);
  const lastSpaceIndex = trimmedText.lastIndexOf(' ');
  if (lastSpaceIndex === -1) {
    return trimmedText + '...';
  }
  return trimmedText.slice(0, lastSpaceIndex) + '...';
}
