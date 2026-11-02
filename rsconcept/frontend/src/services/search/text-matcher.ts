/**
 * Generalized text matcher for Portal search.
 *
 * By default the query is compiled as a case-insensitive `RegExp`. If the pattern is valid but
 * does not match, {@link TextMatcher.test} falls back to plain substring search on the original
 * query (so pastes like `ℬ(R1)×ℬ(C1)` still work). Invalid patterns and patterns with nested
 * quantifiers use substring search only, so a short input cannot stall the tab.
 *
 * Pass `isPlainText` to escape regexp metacharacters and force substring search with no regexp
 * pass.
 */
export class TextMatcher {
  protected query: RegExp | string;
  private plainFallback: string | null;
  private readonly isCaseSensitive: boolean;

  constructor(query: string, isPlainText?: boolean, isCaseSensitive?: boolean) {
    this.isCaseSensitive = !!isCaseSensitive;
    this.plainFallback = isPlainText ? null : query;

    if (!isPlainText && hasNestedQuantifier(query)) {
      this.query = query;
      this.plainFallback = null;
      return;
    }

    if (isPlainText) {
      query = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
    try {
      this.query = new RegExp(query, isCaseSensitive ? '' : 'i');
    } catch (_exception: unknown) {
      this.query = query;
      this.plainFallback = null;
    }
  }

  /** Returns whether `text` matches the query configured in the constructor. */
  test(text: string): boolean {
    if (typeof this.query === 'string') {
      return this.includesPlain(text, this.query);
    }
    if (this.query.test(text)) {
      return true;
    }
    return this.plainFallback !== null && this.includesPlain(text, this.plainFallback);
  }

  private includesPlain(text: string, query: string): boolean {
    if (this.isCaseSensitive) {
      return text.includes(query);
    }
    return text.toLowerCase().includes(query.toLowerCase());
  }
}

/** True when a group that already contains a quantifier is itself quantified, as in `(a+)+`. */
function hasNestedQuantifier(pattern: string): boolean {
  const groupHasQuantifier: boolean[] = [];
  let inClass = false;
  let index = 0;

  while (index < pattern.length) {
    const char = pattern[index];
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (inClass) {
      if (char === ']') {
        inClass = false;
      }
      index += 1;
      continue;
    }
    if (char === '[') {
      inClass = true;
      index += 1;
      continue;
    }
    if (char === '(') {
      groupHasQuantifier.push(false);
      index = skipGroupFlags(pattern, index + 1);
      continue;
    }
    if (char === ')') {
      const containsQuantifier = groupHasQuantifier.pop() ?? false;
      index += 1;
      const quantifierEnd = readQuantifierEnd(pattern, index);
      if (containsQuantifier && quantifierEnd !== null) {
        return true;
      }
      if ((containsQuantifier || quantifierEnd !== null) && groupHasQuantifier.length > 0) {
        groupHasQuantifier[groupHasQuantifier.length - 1] = true;
      }
      if (quantifierEnd !== null) {
        index = quantifierEnd;
      }
      continue;
    }

    const quantifierEnd = readQuantifierEnd(pattern, index);
    if (quantifierEnd !== null) {
      if (groupHasQuantifier.length > 0) {
        groupHasQuantifier[groupHasQuantifier.length - 1] = true;
      }
      index = quantifierEnd;
      continue;
    }
    index += 1;
  }

  return false;
}

function skipGroupFlags(pattern: string, index: number): number {
  if (pattern[index] !== '?') {
    return index;
  }
  const next = pattern[index + 1];
  if (next === ':' || next === '=' || next === '!') {
    return index + 2;
  }
  if (next === '<') {
    const kind = pattern[index + 2];
    if (kind === '=' || kind === '!') {
      return index + 3;
    }
    const close = pattern.indexOf('>', index + 2);
    return close === -1 ? pattern.length : close + 1;
  }
  return index + 1;
}

function readQuantifierEnd(pattern: string, index: number): number | null {
  const char = pattern[index];
  if (char === '+' || char === '*' || char === '?') {
    return pattern[index + 1] === '?' ? index + 2 : index + 1;
  }
  if (char !== '{') {
    return null;
  }
  const match = /^\{\d+(,\d*)?\}/.exec(pattern.slice(index));
  if (!match) {
    return null;
  }
  const end = index + match[0].length;
  return pattern[end] === '?' ? end + 1 : end;
}
