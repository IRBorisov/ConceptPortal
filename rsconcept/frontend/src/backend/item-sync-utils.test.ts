import { QueryClient } from '@tanstack/react-query';
import { describe, expect, test, vi } from 'vitest';

import { KEYS } from '@/backend/configuration';

import {
  invalidateRelatedOss,
  invalidateRelatedSchemas,
  isRemoteAtLeastAsRecent,
  patchLibraryTimestamp
} from './item-sync-utils';

describe('isRemoteAtLeastAsRecent', () => {
  test('rejects remote without timestamp', () => {
    expect(isRemoteAtLeastAsRecent(undefined, '2020-01-02T00:00:00Z')).toBe(false);
  });

  test('accepts remote when local is missing', () => {
    expect(isRemoteAtLeastAsRecent('2020-01-01T00:00:00Z', undefined)).toBe(true);
  });

  test('accepts remote when it is newer than local', () => {
    expect(isRemoteAtLeastAsRecent('2020-01-02T00:00:00Z', '2020-01-01T00:00:00Z')).toBe(true);
  });

  test('accepts remote when it equals local', () => {
    expect(isRemoteAtLeastAsRecent('2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z')).toBe(true);
  });

  test('rejects remote when it is older than local', () => {
    expect(isRemoteAtLeastAsRecent('2020-01-01T00:00:00Z', '2020-01-02T00:00:00Z')).toBe(false);
  });
});

describe('patchLibraryTimestamp', () => {
  test('updates only the matching library item', () => {
    const client = new QueryClient();
    client.setQueryData(KEYS.composite.libraryList, [
      { id: 1, time_update: 'old-1' },
      { id: 2, time_update: 'old-2' }
    ]);

    patchLibraryTimestamp(client, 1, 'new-1');

    expect(client.getQueryData(KEYS.composite.libraryList)).toEqual([
      { id: 1, time_update: 'new-1' },
      { id: 2, time_update: 'old-2' }
    ]);
  });
});

describe('invalidateRelatedOss', () => {
  test('invalidates each linked OSS item', () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    invalidateRelatedOss(client, [{ id: 10 }, { id: 20 }]);

    expect(invalidate).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: KEYS.composite.oss({ itemID: 10 }) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: KEYS.composite.oss({ itemID: 20 }) });
  });
});

describe('invalidateRelatedSchemas', () => {
  test('invalidates each schema item and skips empty ids', () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    invalidateRelatedSchemas(client, [11, null, undefined, 22]);

    expect(invalidate).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: KEYS.composite.schema({ itemID: 11 }) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: KEYS.composite.schema({ itemID: 22 }) });
  });
});
