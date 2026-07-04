/**
 * Generalized text matcher for Portal search.
 *
 * By default the query is compiled as a case-insensitive `RegExp`. Invalid patterns fall back to
 * `String.includes`. Pass `isPlainText` to escape regexp metacharacters and force substring search.
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

  /** Returns whether `text` matches the query configured in the constructor. */
  test(text: string): boolean {
    if (typeof this.query === 'string') {
      return text.includes(this.query);
    } else {
      return !!text.match(this.query);
    }
  }
}
