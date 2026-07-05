import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as schemaSync from '@/features/rsform/backend/schema-sync';

import { KEYS } from '@/backend/configuration';
import { createMinimalOssDTO } from '@/backend/test/sync-fixtures';

import { syncOssTargetItemUpdate } from './api';
import * as ossSync from './oss-sync';

describe('syncOssTargetItemUpdate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('patches caches and notifies when target operation links to a schema', async () => {
    const client = new QueryClient();
    const data = createMinimalOssDTO({
      id: 10,
      time_update: '2020-01-02T00:00:00Z',
      operations: [{ id: 5, result: 42, alias: 'op-a' } as never]
    });
    const ossKey = KEYS.composite.oss({ itemID: 10 });
    const schemaKey = KEYS.composite.schema({ itemID: 42 });

    client.setQueryData(ossKey, createMinimalOssDTO({ id: 10, time_update: '2020-01-01T00:00:00Z' }));
    client.setQueryData(KEYS.composite.libraryList, [
      { id: 10, time_update: 'old-oss' },
      { id: 42, title: 'Schema', time_update: 'old-schema' }
    ]);

    const notifyOssSync = vi.spyOn(ossSync, 'notifyOssSync').mockImplementation(vi.fn());
    const notifySchemaSync = vi.spyOn(schemaSync, 'notifySchemaSync').mockImplementation(vi.fn());
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    await syncOssTargetItemUpdate(client, data, {
      data: { target: 5, item_data: { title: 'Updated schema' } }
    });

    expect(client.getQueryData(ossKey)).toEqual(data);
    const libraryList = client.getQueryData<{ id: number; title?: string; time_update: string }[]>(
      KEYS.composite.libraryList
    );
    expect(libraryList?.[0]).toEqual({ id: 10, time_update: '2020-01-02T00:00:00Z' });
    expect(libraryList?.[1]).toMatchObject({ id: 42, title: 'Updated schema' });
    expect(typeof libraryList?.[1]?.time_update).toBe('string');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: schemaKey });
    expect(notifyOssSync).toHaveBeenCalledWith(10, data);
    expect(notifySchemaSync).toHaveBeenCalledWith(42);
  });

  test('stops after OSS sync when target operation is missing', async () => {
    const client = new QueryClient();
    const data = createMinimalOssDTO({
      id: 10,
      time_update: '2020-01-02T00:00:00Z',
      operations: []
    });

    vi.spyOn(ossSync, 'notifyOssSync').mockImplementation(vi.fn());
    const notifySchemaSync = vi.spyOn(schemaSync, 'notifySchemaSync').mockImplementation(vi.fn());
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    await syncOssTargetItemUpdate(client, data, {
      data: { target: 5, item_data: { title: 'Ignored' } }
    });

    expect(invalidate).not.toHaveBeenCalled();
    expect(notifySchemaSync).not.toHaveBeenCalled();
  });
});
