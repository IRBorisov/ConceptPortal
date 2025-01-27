/**
 * Module: Utility functions.
 */

import axios, { AxiosError, AxiosHeaderValue, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

import { AliasMapping } from '@/models/rslang';

import { information, prompts } from './labels';

/**
 * Checks if arguments is Node.
 */
export function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (e === null || !('nodeType' in e)) {
    throw new TypeError(`Expected 'Node' but received '${e?.constructor.name ?? 'null'}'`);
  }
}

/**
 * Wrapper class for generalized text matching.
 *
 * If possible create regexp, otherwise use symbol matching.
 */
export class TextMatcher {
  protected query: RegExp | string;

  constructor(query: string, isPlainText?: boolean, isCaseSensitive?: boolean) {
    if (isPlainText) {
      query = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
    try {
      this.query = new RegExp(query, isCaseSensitive ? '' : 'i');
    } catch (_exception: unknown) {
      this.query = query;
    }
  }

  test(text: string): boolean {
    if (typeof this.query === 'string') {
      return text.includes(this.query);
    } else {
      return !!text.match(this.query);
    }
  }
}

/**
 * Text substitution guided by mapping and regular expression.
 */
export function applyPattern(text: string, mapping: AliasMapping, pattern: RegExp): string {
  if (text === '' || pattern === null) {
    return text;
  }
  let posInput = 0;
  let output = '';
  const patternMatches = text.matchAll(pattern);
  for (const segment of patternMatches) {
    const entity = segment[0];
    const start = segment.index ?? 0;
    if (entity in mapping) {
      output += text.substring(posInput, start);
      output += mapping[entity];
      posInput = start + segment[0].length;
    }
  }
  output += text.substring(posInput);
  return output;
}

/**
 * Truncate text to last word up to max symbols. Add ellipsis if truncated.
 */
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

/**
 * Truncate text to max symbols. Add ellipsis if truncated.
 */
export function truncateToSymbol(text: string, maxSymbols: number): string {
  if (text.length <= maxSymbols) {
    return text;
  }
  const trimmedText = text.slice(0, maxSymbols);
  return trimmedText + '...';
}

/**
 * Check if Axios response is html.
 */
export function isResponseHtml(response?: AxiosResponse) {
  if (!response) {
    return false;
  }
  const header = response.headers['content-type'] as AxiosHeaderValue;
  if (!header) {
    return false;
  }
  if (typeof header === 'number' || typeof header === 'boolean') {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return header.includes('text/html');
}

/**
 * Convert base64 string to Blob uint8.
 */
export function convertBase64ToBlob(base64String: string): Uint8Array {
  const arr = base64String.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const uint8Array = new Uint8Array(n);
  while (n--) {
    uint8Array[n] = bstr.charCodeAt(n);
  }
  return uint8Array;
}

/**
 * Prompt user of confirming discarding changes before continue.
 */
export function promptUnsaved(): boolean {
  return window.confirm(prompts.promptUnsaved);
}

/**
 * Toggle tristate flag: undefined - true - false.
 */
export function toggleTristateFlag(prev: boolean | undefined): boolean | undefined {
  if (prev === undefined) {
    return true;
  }
  return prev ? false : undefined;
}

/**
 * Toggle tristate color: gray - green - red .
 */
export function tripleToggleColor(value: boolean | undefined): string {
  if (value === undefined) {
    return 'clr-text-controls';
  }
  return value ? 'text-ok-600' : 'text-warn-600';
}

/**
 * Extract error message from error object.
 */
export function extractErrorMessage(error: Error | AxiosError): string {
  if (axios.isAxiosError(error)) {
    if (error.response && error.response.status === 400) {
      const data = error.response.data as Record<string, unknown>;
      const keys = Object.keys(data);
      if (keys.length === 1) {
        const value = data[keys[0]];
        if (typeof value === 'string') {
          return `${keys[0]}: ${value}`;
        }
      }
    }
  }
  return error.message;
}

/**
 * Convert array of objects to CSV Blob.
 */
export function convertToCSV(targetObj: object[]): Blob {
  if (!targetObj || targetObj.length === 0) {
    return new Blob([], { type: 'text/csv;charset=utf-8;' });
  }
  const separator = ',';
  const keys = Object.keys(targetObj[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    (targetObj as Record<string, string | Date | number>[])
      .map(item => {
        return keys
          .map(k => {
            let cell = item[k] === null || item[k] === undefined ? '' : item[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generates a QR code for the current page.
 */
export function generatePageQR(): string {
  const currentRef = window.location.href;
  return currentRef.includes('?') ? currentRef + '&qr' : currentRef + '?qr';
}

/**
 * Copies sharable link to the current page.
 */
export function sharePage() {
  const currentRef = window.location.href;
  const url = currentRef.includes('?') ? currentRef + '&share' : currentRef + '?share';
  navigator.clipboard
    .writeText(url)
    .then(() => toast.success(information.linkReady))
    .catch(console.error);
}
