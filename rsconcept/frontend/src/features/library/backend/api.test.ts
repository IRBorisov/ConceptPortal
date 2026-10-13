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
    const order: string[] = [];
    const onAdminForbidden = vi.fn(() => {
      order.push('forbidden');
    });
    vi.mocked(axiosGet).mockImplementation(request => {
      if (request.endpoint === '/api/library/all') {
        order.push('all');
        return Promise.reject(axiosError(403, { detail: 'Учетные данные не были предоставлены.' }));
      }
      order.push('active');
      return Promise.resolve(activeItems);
    });

    await expect(fetchLibrary(true, onAdminForbidden)).resolves.toEqual(activeItems);
    expect(order).toEqual(['all', 'forbidden', 'active']);
  });

  it('turns admin mode off even when the active list also fails', async () => {
    const onAdminForbidden = vi.fn();
    const activeError = axiosError(500, { detail: 'boom' });
    vi.mocked(axiosGet).mockImplementation(request => {
      if (request.endpoint === '/api/library/all') {
        return Promise.reject(axiosError(403, { detail: 'Учетные данные не были предоставлены.' }));
      }
      return Promise.reject(activeError);
    });

    await expect(fetchLibrary(true, onAdminForbidden)).rejects.toBe(activeError);
    expect(onAdminForbidden).toHaveBeenCalledOnce();
  });

  it('rethrows failures other than 403', async () => {
    const onAdminForbidden = vi.fn();
    const error = axiosError(500, { detail: 'boom' });
    vi.mocked(axiosGet).mockRejectedValue(error);

    await expect(fetchLibrary(true, onAdminForbidden)).rejects.toBe(error);
    expect(onAdminForbidden).not.toHaveBeenCalled();
  });
});
