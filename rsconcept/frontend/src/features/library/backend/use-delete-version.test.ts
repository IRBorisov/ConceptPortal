import { QueryClient } from '@tanstack/react-query';
import { describe, expect, test } from 'vitest';

import { type RSFormDTO } from '@/features/rsform';

import { KEYS } from '@/backend/configuration';
import { createMinimalRSFormDTO } from '@/backend/test/sync-fixtures';

import { applyDeletedVersion } from './use-delete-version';

const VERSION_38 = { id: 38, version: '1.0.0', description: 'a', time_create: '2020-01-01T00:00:00Z' };
const VERSION_39 = { id: 39, version: '1.1.0', description: 'b', time_create: '2020-01-02T00:00:00Z' };

function cacheEntry(overrides: Partial<RSFormDTO> = {}) {
  const raw = createMinimalRSFormDTO({
    id: 885,
    versions: [VERSION_38, VERSION_39],
    ...overrides
  });
  return { raw, transformed: { ...raw, items: [] } };
}

describe('applyDeletedVersion', () => {
  test('drops the version from latest and versioned schema caches', () => {
    const client = new QueryClient();
    const latestKey = KEYS.composite.schema({ itemID: 885 });
    const version38Key = KEYS.composite.schema({ itemID: 885, version: 38 });
    const version39Key = KEYS.composite.schema({ itemID: 885, version: 39 });

    client.setQueryData(latestKey, cacheEntry());
    client.setQueryData(version38Key, cacheEntry({ version: 38 }));
    client.setQueryData(version39Key, cacheEntry({ version: 39 }));

    applyDeletedVersion(client, 885, 39);

    expect(client.getQueryData<{ raw: RSFormDTO }>(latestKey)?.raw.versions).toEqual([VERSION_38]);
    expect(client.getQueryData<{ raw: RSFormDTO }>(version38Key)?.raw.versions).toEqual([VERSION_38]);
    expect(client.getQueryData(version39Key)).toBeUndefined();
  });

  test('does not throw when the schema cache is missing', () => {
    const client = new QueryClient();
    expect(() => applyDeletedVersion(client, 885, 39)).not.toThrow();
  });
});
