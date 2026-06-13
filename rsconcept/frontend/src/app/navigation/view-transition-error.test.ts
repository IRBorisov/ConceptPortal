import { describe, expect, it } from 'vitest';

import { absorbViewTransitionAbort, isViewTransitionAbortError } from './view-transition-error';

describe('isViewTransitionAbortError', () => {
  it('matches invalid state aborts', () => {
    const error = new DOMException('Transition was aborted because of invalid state', 'InvalidStateError');
    expect(isViewTransitionAbortError(error)).toBe(true);
  });

  it('matches invalid state aborts wrapped as plain errors', () => {
    const error = new Error('InvalidStateError: Transition was aborted because of invalid state');
    expect(isViewTransitionAbortError(error)).toBe(true);
  });

  it('matches timeout aborts', () => {
    const error = new Error('Transition was aborted because of timeout in DOM update');
    error.name = 'TimeoutError';
    expect(isViewTransitionAbortError(error)).toBe(true);
  });

  it('matches overlapping transition aborts', () => {
    const error = new DOMException('Old view transition aborted by new view transition', 'AbortError');
    expect(isViewTransitionAbortError(error)).toBe(true);
  });

  it('ignores InvalidStateError with unrelated message', () => {
    const error = new DOMException('The object is in an invalid state', 'InvalidStateError');
    expect(isViewTransitionAbortError(error)).toBe(false);
  });

  it('ignores TimeoutError with unrelated message', () => {
    const error = new Error('The operation timed out');
    error.name = 'TimeoutError';
    expect(isViewTransitionAbortError(error)).toBe(false);
  });

  it('ignores unrelated errors', () => {
    expect(isViewTransitionAbortError(new Error('Network request failed'))).toBe(false);
  });

  it('ignores abort names without transition context', () => {
    const error = new DOMException('Document is not active', 'InvalidStateError');
    expect(isViewTransitionAbortError(error)).toBe(false);
  });

  it('ignores messages with only transition-aborted text', () => {
    expect(isViewTransitionAbortError('Transition was aborted')).toBe(false);
  });

  it('ignores messages with only view-transition mention', () => {
    expect(isViewTransitionAbortError('view transition failed')).toBe(false);
  });

  it('matches string errors with both transition signals', () => {
    expect(isViewTransitionAbortError('Transition was aborted during view transition')).toBe(true);
  });

  it('matches string errors with abort type and transition-aborted text', () => {
    expect(
      isViewTransitionAbortError('Error: InvalidStateError: Transition was aborted because of invalid state')
    ).toBe(true);
  });
});

describe('absorbViewTransitionAbort', () => {
  it('swallows expected rejections', async () => {
    const error = new DOMException('Transition was aborted because of invalid state', 'InvalidStateError');
    await expect(absorbViewTransitionAbort(Promise.reject(error))).resolves.toBeUndefined();
  });

  it('rethrows unexpected rejections', async () => {
    const error = new Error('boom');
    await expect(absorbViewTransitionAbort(Promise.reject(error))).rejects.toThrow('boom');
  });
});
