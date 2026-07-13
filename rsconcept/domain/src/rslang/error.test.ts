import { describe, expect, it } from 'vitest';

import { type EvalStackFrame,formatEvalCallStack } from './error';

describe('formatEvalCallStack', () => {
  it('returns empty string for missing or empty stack', () => {
    expect(formatEvalCallStack(undefined)).toBe('');
    expect(formatEvalCallStack([])).toBe('');
  });

  it('formats callee aliases from outermost call to innermost fault', () => {
    const stack: EvalStackFrame[] = [
      { alias: 'F12', from: 10, to: 12 },
      { alias: 'F5', from: 8, to: 14 }
    ];
    expect(formatEvalCallStack(stack)).toBe('F5 → F12');
  });

  it('formats a single nested call', () => {
    const stack: EvalStackFrame[] = [{ alias: 'F9', from: 7, to: 8 }];
    expect(formatEvalCallStack(stack)).toBe('F9');
  });
});
