/**
 * Generalized text matcher for Portal search.
 *
 * By default the query is compiled as a case-insensitive `RegExp`. If the pattern is valid but
 * does not match, {@link TextMatcher.test} falls back to plain substring search on the original
 * query (so pastes like `ℬ(R1)×ℬ(C1)` still work). Invalid patterns use substring search only.
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
