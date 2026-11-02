import { QueryClient } from '@tanstack/react-query';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { axiosGet } from '@/backend/api-transport';
import { shouldRetryQuery } from '@/backend/query-client';

import { authApi } from './api';
import { anonymousCurrentUser, type ICurrentUser } from './types';

vi.mock('@/backend/api-transport', () => ({
  axiosGet: vi.fn(),
  axiosPatch: vi.fn(),
  axiosPost: vi.fn(),
  isAxiosError: (error: unknown) => error instanceof AxiosError
}));

const loggedIn: ICurrentUser = { id: 7, username: 'ada', is_staff: false, editor: [] };

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

describe('authApi.getAuthQueryOptions', () => {
  beforeEach(() => {
    vi.mocked(axiosGet).mockReset();
  });

  it('does not replace the session with an anonymous user after network failures', async () => {
    vi.mocked(axiosGet).mockRejectedValue(new AxiosError('Network Error'));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: shouldRetryQuery, retryDelay: 0 } }
    });
    const options = authApi.getAuthQueryOptions();
    client.setQueryData(options.queryKey, loggedIn);

    await expect(client.fetchQuery({ ...options, staleTime: 0 })).rejects.toBeInstanceOf(AxiosError);

    expect(client.getQueryData<ICurrentUser>(options.queryKey)?.id).toBe(7);
    expect(vi.mocked(axiosGet)).toHaveBeenCalledTimes(3);
  });

  it('keeps the signed-in user after a 401 refresh', async () => {
    vi.mocked(axiosGet).mockRejectedValue(axiosError(401, { detail: 'Unauthorized' }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const options = authApi.getAuthQueryOptions();
    client.setQueryData(options.queryKey, loggedIn);

    await expect(client.fetchQuery({ ...options, staleTime: 0 })).rejects.toBeInstanceOf(AxiosError);

    expect(client.getQueryData<ICurrentUser>(options.queryKey)?.id).toBe(7);
    expect(vi.mocked(axiosGet)).toHaveBeenCalledTimes(1);
  });

  it('keeps an explicit anonymous payload from the server', async () => {
    vi.mocked(axiosGet).mockResolvedValue({ ...anonymousCurrentUser, csrfToken: 'token' });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const options = authApi.getAuthQueryOptions();

    const user = await client.fetchQuery({ ...options, staleTime: 0 });

    expect(user.id).toBeNull();
  });
});
