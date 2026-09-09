import { AxiosError, CanceledError } from 'axios';
import { describe, expect, it } from 'vitest';

import { isAbortedRequestError } from './aborted-request-error';

const REQUEST_ABORTED = 'Request aborted';

describe('isAbortedRequestError', () => {
  it('matches axios xhr abort', () => {
    expect(isAbortedRequestError(new AxiosError(REQUEST_ABORTED, AxiosError.ECONNABORTED))).toBe(true);
  });

  it('matches axios CanceledError', () => {
    expect(isAbortedRequestError(new CanceledError())).toBe(true);
  });

  it('matches serialized sentry exception text', () => {
    expect(isAbortedRequestError('AxiosError: Request aborted')).toBe(true);
  });

  it('ignores axios timeouts that share ECONNABORTED', () => {
    expect(isAbortedRequestError(new AxiosError('timeout of 10000ms exceeded', AxiosError.ECONNABORTED))).toBe(false);
  });

  it('ignores network failures', () => {
    expect(isAbortedRequestError(new AxiosError('Network Error', AxiosError.ERR_NETWORK))).toBe(false);
  });

  it('ignores view-transition abort text', () => {
    expect(isAbortedRequestError('Transition was aborted during view transition')).toBe(false);
  });

  it('ignores unrelated errors', () => {
    expect(isAbortedRequestError(new Error('boom'))).toBe(false);
    expect(isAbortedRequestError(null)).toBe(false);
  });
});
