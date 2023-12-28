/**
 * Module: Utility functions.
 */

import { AxiosHeaderValue, AxiosResponse } from 'axios';

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
    } catch (exception: unknown) {
      this.query = query;
    }
  }

  test(text: string): boolean {
    if (typeof this.query === 'string') {
      return text.indexOf(this.query) !== -1;
    } else {
      return !!text.match(this.query);
    }
  }
}

/**
 * Text substitution guided by mapping and regular expression.
 */
export function applyPattern(text: string, mapping: { [key: string]: string }, pattern: RegExp): string {
  if (text === '' || pattern === null) {
    return text;
  }
  let posInput = 0;
  let output = '';
  const patternMatches = text.matchAll(pattern);
  for (const segment of patternMatches) {
    const entity = segment[0];
    const start = segment.index!;
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
