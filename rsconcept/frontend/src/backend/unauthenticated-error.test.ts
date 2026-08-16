import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import { isUnauthenticatedAxiosError } from './unauthenticated-error';

function axiosError(status: number, data: unknown, message = `Request failed with status code ${status}`): AxiosError {
  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, {} as InternalAxiosRequestConfig, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig
  } as AxiosResponse);
}

describe('isUnauthenticatedAxiosError', () => {
  it('detects 401', () => {
    expect(isUnauthenticatedAxiosError(axiosError(401, { detail: 'Unauthorized' }))).toBe(true);
  });

  it('detects DRF NotAuthenticated 403 (en)', () => {
    expect(
      isUnauthenticatedAxiosError(axiosError(403, { detail: 'Authentication credentials were not provided.' }))
    ).toBe(true);
  });

  it('detects DRF NotAuthenticated 403 (ru)', () => {
    expect(isUnauthenticatedAxiosError(axiosError(403, { detail: 'Учетные данные не были предоставлены.' }))).toBe(
      true
    );
  });

  it('ignores CSRF 403', () => {
    expect(isUnauthenticatedAxiosError(axiosError(403, { detail: 'CSRF Failed: CSRF token missing.' }))).toBe(false);
  });

  it('ignores permission denied 403', () => {
    expect(
      isUnauthenticatedAxiosError(axiosError(403, { detail: 'You do not have permission to perform this action.' }))
    ).toBe(false);
  });

  it('ignores non-axios errors', () => {
    expect(isUnauthenticatedAxiosError(new Error('boom'))).toBe(false);
  });
});
