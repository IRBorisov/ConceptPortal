import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import { relativizationFailureMessageId } from './request-error';

function axiosError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    {} as InternalAxiosRequestConfig,
    undefined,
    {
      status,
      data,
      statusText: '',
      headers: {},
      config: {} as InternalAxiosRequestConfig
    } as AxiosResponse
  );
}

describe('relativizationFailureMessageId', () => {
  it('explains an operation schema shared more widely than its sources', () => {
    const error = axiosError(403, { detail: 'The result cannot be shared more widely than its source schemas.' });
    expect(relativizationFailureMessageId(error)).toBe('tx.oss.relativization.access.audience');
  });

  it('explains an unreadable source schema', () => {
    const error = axiosError(403, { detail: 'Every source schema must be readable.' });
    expect(relativizationFailureMessageId(error)).toBe('tx.oss.relativization.access.source');
  });

  it('explains a generic permission refusal', () => {
    const error = axiosError(403, { detail: 'You do not have permission to perform this action.' });
    expect(relativizationFailureMessageId(error)).toBe('tx.oss.relativization.access.forbidden');
  });

  it('leaves validation and CSRF failures to the usual error text', () => {
    expect(relativizationFailureMessageId(axiosError(400, { detail: 'Choose a valid base set.' }))).toBeNull();
    expect(relativizationFailureMessageId(axiosError(403, { detail: 'CSRF Failed: CSRF token missing.' }))).toBeNull();
    expect(relativizationFailureMessageId(new Error('offline'))).toBeNull();
  });
});
