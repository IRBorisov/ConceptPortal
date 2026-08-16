import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { axiosGet } from '@/backend/api-transport';
import { queryClient } from '@/backend/query-client';

import { usersApi } from './api';

vi.mock('@/backend/api-transport', () => ({
  axiosGet: vi.fn(),
  axiosPatch: vi.fn(),
  axiosPost: vi.fn()
}));

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

async function fetchUsers() {
  const { queryFn, queryKey } = usersApi.getUsersQueryOptions();
  if (queryFn === undefined) {
    throw new Error('expected queryFn');
  }
  return queryFn({
    client: queryClient,
    queryKey,
    signal: new AbortController().signal,
    meta: undefined
  });
}

describe('usersApi.getUsersQueryOptions', () => {
  beforeEach(() => {
    vi.mocked(axiosGet).mockReset();
  });

  it('returns the active users list', async () => {
    const users = [{ id: 1, first_name: 'Ada', last_name: 'Lovelace' }];
    vi.mocked(axiosGet).mockResolvedValue(users);

    await expect(fetchUsers()).resolves.toEqual(users);
  });

  it('returns an empty list when credentials are missing', async () => {
    vi.mocked(axiosGet).mockRejectedValue(axiosError(403, { detail: 'Учетные данные не были предоставлены.' }));

    await expect(fetchUsers()).resolves.toEqual([]);
  });

  it('rethrows other failures', async () => {
    const error = axiosError(500, { detail: 'boom' });
    vi.mocked(axiosGet).mockRejectedValue(error);

    await expect(fetchUsers()).rejects.toBe(error);
  });
});
