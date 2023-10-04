export function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !('nodeType' in e)) {
    throw new Error('Node expected');
  }
}

export async function delay(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export function trimString(target: string, maxLen: number): string {
  if (target.length < maxLen) {
    return target;
  } else {
    return target.substring(0, maxLen) + '...';
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
