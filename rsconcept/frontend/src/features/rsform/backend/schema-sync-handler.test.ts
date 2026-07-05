import { QueryClient } from '@tanstack/react-query';
import { describe, expect, test, vi } from 'vitest';

import { KEYS } from '@/backend/configuration';
import * as crossTabResetNotify from '@/backend/cross-tab-reset-notify';
import { createMinimalRSFormDTO } from '@/backend/test/sync-fixtures';

import * as schemaApi from './api';
import { handleSchemaSyncEvent } from './schema-sync-handler';
import { type RSFormDTO } from './types';

const OTHER_TAB_ID = 'other-tab-id';

describe('handleSchemaSyncEvent', () => {
  test('seeds schema cache when a newer DTO arrives on an uncached tab', () => {
    const client = new QueryClient();
    const schemaKey = KEYS.composite.schema({ itemID: 1 });
    const fresh = createMinimalRSFormDTO({
      id: 1,
      time_update: '2020-01-02T00:00:00Z',
      title: 'From other tab'
    });

    handleSchemaSyncEvent({ sourceId: OTHER_TAB_ID, itemID: 1, data: fresh }, client);

    expect(client.getQueryData<{ raw: RSFormDTO }>(schemaKey)?.raw.title).toBe('From other tab');
  });

  test('patches schema and library caches when a newer DTO arrives from another tab', () => {
    const client = new QueryClient();
    const schemaKey = KEYS.composite.schema({ itemID: 1 });
    const stale = createMinimalRSFormDTO({
      id: 1,
      time_update: '2020-01-01T00:00:00Z',
      title: 'Old title',
      oss: [{ id: 10, alias: 'oss-a' }]
    });
    const fresh = createMinimalRSFormDTO({
      id: 1,
      time_update: '2020-01-02T00:00:00Z',
      title: 'New title',
      oss: [{ id: 10, alias: 'oss-a' }]
    });

    client.setQueryData(schemaKey, { raw: stale, transformed: { ...stale, cst: [] } });
    client.setQueryData(KEYS.composite.libraryList, [{ id: 1, time_update: stale.time_update }]);

    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleSchemaSyncEvent({ sourceId: OTHER_TAB_ID, itemID: 1, data: fresh }, client);

    const cached = client.getQueryData<{ raw: RSFormDTO }>(schemaKey);
    expect(cached?.raw.title).toBe('New title');
    expect(client.getQueryData(KEYS.composite.libraryList)).toEqual([{ id: 1, time_update: fresh.time_update }]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: KEYS.composite.oss({ itemID: 10 }) });
  });

  test('invalidates when an older DTO arrives from another tab', async () => {
    const client = new QueryClient();
    const schemaKey = KEYS.composite.schema({ itemID: 1 });
    const local = createMinimalRSFormDTO({
      id: 1,
      time_update: '2020-01-02T00:00:00Z',
      title: 'Current title'
    });
    const stale = createMinimalRSFormDTO({
      id: 1,
      time_update: '2020-01-01T00:00:00Z',
      title: 'Stale title'
    });

    client.setQueryData(schemaKey, { raw: local, transformed: { ...local, cst: [] } });
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleSchemaSyncEvent({ sourceId: OTHER_TAB_ID, itemID: 1, data: stale }, client);

    expect(client.getQueryData<{ raw: RSFormDTO }>(schemaKey)?.raw.title).toBe('Current title');
    await vi.waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: KEYS.composite.schema({ itemID: 1 }),
        exact: true
      });
    });
  });

  test('invalidates schema and library queries on refetch-only events', async () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleSchemaSyncEvent({ sourceId: OTHER_TAB_ID, itemID: 42 }, client);

    await vi.waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: KEYS.composite.schema({ itemID: 42 }),
        exact: true
      });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: KEYS.composite.libraryList });
    });
  });

  test('notifies before applying DTO so unsaved edits are still detected', () => {
    const client = new QueryClient();
    const schemaKey = KEYS.composite.schema({ itemID: 1 });
    const local = createMinimalRSFormDTO({ id: 1, time_update: '2020-01-01T00:00:00Z' });
    const fresh = createMinimalRSFormDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'New title' });
    const callOrder: string[] = [];

    client.setQueryData(schemaKey, { raw: local, transformed: { ...local, cst: [] } });
    vi.spyOn(crossTabResetNotify, 'prepareCrossTabDataReset').mockImplementation(() => {
      return () => {
        callOrder.push('notify');
      };
    });
    vi.spyOn(schemaApi, 'applyRSForm').mockImplementation(() => {
      callOrder.push('apply');
    });

    handleSchemaSyncEvent({ sourceId: OTHER_TAB_ID, itemID: 1, data: fresh }, client);

    expect(callOrder).toEqual(['notify', 'apply']);
  });

  test('falls back to refetch-only handling for invalid DTO payloads', async () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleSchemaSyncEvent(
      {
        sourceId: OTHER_TAB_ID,
        itemID: 5,
        data: { id: 5 } as never
      },
      client
    );

    await vi.waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: KEYS.composite.schema({ itemID: 5 }),
        exact: true
      });
    });
  });
});
