export function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !('nodeType' in e)) {
    throw new Error('Node expected');
  }
}

/**
 * Wrapper class for generalized text matching.
 * 
 * If possible create regexp, otherwise use symbol matching.
*/
export class TextMatcher {
  protected query: RegExp | string
  
  constructor(query: string, isPlainText?: boolean, isCaseSensitive?: boolean) {
    if (isPlainText) {
      query = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
    try {
      this.query = new RegExp(query, isCaseSensitive ? '' : 'i');
    } catch(exception: unknown) {
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
