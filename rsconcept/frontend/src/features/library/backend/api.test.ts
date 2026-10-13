import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { axiosGet } from '@/backend/api-transport';
import { queryClient } from '@/backend/query-client';

import { libraryApi } from './api';

vi.mock('@/backend/api-transport', () => ({
  axiosGet: vi.fn(),
  axiosPatch: vi.fn(),
  axiosPost: vi.fn(),
  axiosDelete: vi.fn(),
  isAxiosError: (error: unknown) => error instanceof AxiosError
}));

const activeItems = [{ id: 1 }];
const adminItems = [{ id: 1 }, { id: 2 }];

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

async function fetchLibrary(isAdmin: boolean, onAdminForbidden?: () => void) {
  const options = libraryApi.getLibraryQueryOptions({ isAdmin, onAdminForbidden });
  const { queryFn, queryKey } = options;
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

describe('libraryApi.getLibraryQueryOptions', () => {
  beforeEach(() => {
    vi.mocked(axiosGet).mockReset();
    queryClient.clear();
  });

  it('loads the active list for a regular user', async () => {
    vi.mocked(axiosGet).mockResolvedValue(activeItems);

    await expect(fetchLibrary(false)).resolves.toEqual(activeItems);
    expect(axiosGet).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/library/active' }));
  });

  it('loads every item for an admin', async () => {
    vi.mocked(axiosGet).mockResolvedValue(adminItems);

    await expect(fetchLibrary(true)).resolves.toEqual(adminItems);
    expect(axiosGet).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: '/api/library/all', notifyOnError: false })
    );
  });

  it('falls back to the active list when the admin list is forbidden', async () => {
    const onAdminForbidden = vi.fn();
    vi.mocked(axiosGet)
      .mockRejectedValueOnce(axiosError(403, { detail: 'Учетные данные не были предоставлены.' }))
      .mockResolvedValueOnce(activeItems);

    await expect(fetchLibrary(true, onAdminForbidden)).resolves.toEqual(activeItems);
    expect(onAdminForbidden).toHaveBeenCalledOnce();
    expect(axiosGet).toHaveBeenNthCalledWith(1, expect.objectContaining({ endpoint: '/api/library/all' }));
    expect(axiosGet).toHaveBeenNthCalledWith(2, expect.objectContaining({ endpoint: '/api/library/active' }));
  });

  it('rethrows failures other than 403', async () => {
    const onAdminForbidden = vi.fn();
    const error = axiosError(500, { detail: 'boom' });
    vi.mocked(axiosGet).mockRejectedValue(error);

    await expect(fetchLibrary(true, onAdminForbidden)).rejects.toBe(error);
    expect(onAdminForbidden).not.toHaveBeenCalled();
  });
});
