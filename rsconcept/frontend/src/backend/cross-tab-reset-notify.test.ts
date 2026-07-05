import { toast } from 'react-toastify';
import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { type OperationSchemaDTO } from '@/features/oss/backend/types';
import { type RSModelDTO } from '@/features/rsmodel/backend/types';

import { KEYS } from '@/backend/configuration';
import {
  getOpenConceptItemId,
  notifyCrossTabDataReset,
  prepareCrossTabDataReset,
  setOpenSchemaItemId
} from '@/backend/cross-tab-reset-notify';
import { useModificationStore } from '@/stores/modification';

function stubPathname(pathname: string) {
  vi.stubGlobal('window', { location: { pathname } });
}

describe('cross-tab reset notify', () => {
  beforeEach(() => {
    useModificationStore.setState({ isModified: false });
    setOpenSchemaItemId(undefined);
    vi.spyOn(toast, 'info').mockImplementation(() => 'toast-id');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    setOpenSchemaItemId(undefined);
    useModificationStore.setState({ isModified: false });
  });

  test('getOpenConceptItemId parses concept editor routes', () => {
    stubPathname('/rsforms/12');
    expect(getOpenConceptItemId()).toBe(12);

    stubPathname('/oss/34');
    expect(getOpenConceptItemId()).toBe(34);

    stubPathname('/models/56');
    expect(getOpenConceptItemId()).toBe(56);

    stubPathname('/library');
    expect(getOpenConceptItemId()).toBeUndefined();
  });

  test('shows toast and clears modified flag for the open item', () => {
    stubPathname('/rsforms/7');
    useModificationStore.setState({ isModified: true });

    notifyCrossTabDataReset(7);

    expect(useModificationStore.getState().isModified).toBe(false);
    expect(toast.info).toHaveBeenCalledOnce();
  });

  test('does nothing when edits belong to another item', () => {
    stubPathname('/rsforms/7');
    useModificationStore.setState({ isModified: true });

    notifyCrossTabDataReset(99);

    expect(useModificationStore.getState().isModified).toBe(true);
    expect(toast.info).not.toHaveBeenCalled();
  });

  test('does nothing when there are no unsaved edits', () => {
    stubPathname('/rsforms/7');

    notifyCrossTabDataReset(7);

    expect(toast.info).not.toHaveBeenCalled();
  });

  test('shows toast for embedded schema editor when route item id differs', () => {
    stubPathname('/models/56');
    setOpenSchemaItemId(123);
    useModificationStore.setState({ isModified: true });

    notifyCrossTabDataReset(123);

    expect(useModificationStore.getState().isModified).toBe(false);
    expect(toast.info).toHaveBeenCalledOnce();
  });

  test('prepareCrossTabDataReset keeps snapshot when modified flag is cleared before notify', () => {
    stubPathname('/rsforms/7');
    useModificationStore.setState({ isModified: true });

    const notifyReset = prepareCrossTabDataReset(7);
    useModificationStore.setState({ isModified: false });

    notifyReset();

    expect(toast.info).toHaveBeenCalledOnce();
  });
});

describe('handleOssSyncEvent', () => {
  test('patches OSS and library caches when a newer DTO arrives from another tab', async () => {
    const { handleOssSyncEvent } = await import('@/features/oss/backend/oss-sync-handler');
    const { createMinimalOssDTO } = await import('@/backend/test/sync-fixtures');
    const client = new QueryClient();
    const ossKey = KEYS.composite.oss({ itemID: 1 });
    const stale = createMinimalOssDTO({ id: 1, time_update: '2020-01-01T00:00:00Z', title: 'Old title' });
    const fresh = createMinimalOssDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'New title' });

    client.setQueryData(ossKey, stale);
    client.setQueryData(KEYS.composite.libraryList, [{ id: 1, time_update: stale.time_update }]);
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleOssSyncEvent({ sourceId: 'other-tab', itemID: 1, data: fresh }, client);

    expect(client.getQueryData<OperationSchemaDTO>(ossKey)?.title).toBe('New title');
    expect(client.getQueryData(KEYS.composite.libraryList)).toEqual([{ id: 1, time_update: fresh.time_update }]);
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: KEYS.composite.oss({ itemID: 1 }),
      exact: true
    });
  });

  test('seeds OSS cache when a newer DTO arrives on an uncached tab', async () => {
    const { handleOssSyncEvent } = await import('@/features/oss/backend/oss-sync-handler');
    const { createMinimalOssDTO } = await import('@/backend/test/sync-fixtures');
    const client = new QueryClient();
    const ossKey = KEYS.composite.oss({ itemID: 1 });
    const fresh = createMinimalOssDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'From other tab' });

    handleOssSyncEvent({ sourceId: 'other-tab', itemID: 1, data: fresh }, client);

    expect(client.getQueryData<OperationSchemaDTO>(ossKey)?.title).toBe('From other tab');
  });

  test('invalidates when an older DTO arrives from another tab', async () => {
    const { handleOssSyncEvent } = await import('@/features/oss/backend/oss-sync-handler');
    const { createMinimalOssDTO } = await import('@/backend/test/sync-fixtures');
    const client = new QueryClient();
    const ossKey = KEYS.composite.oss({ itemID: 1 });
    const local = createMinimalOssDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'Current title' });
    const stale = createMinimalOssDTO({ id: 1, time_update: '2020-01-01T00:00:00Z', title: 'Stale title' });

    client.setQueryData(ossKey, local);
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleOssSyncEvent({ sourceId: 'other-tab', itemID: 1, data: stale }, client);

    expect(client.getQueryData<OperationSchemaDTO>(ossKey)?.title).toBe('Current title');
    await vi.waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: KEYS.composite.oss({ itemID: 1 }),
        exact: true
      });
    });
  });
});

describe('handleModelSyncEvent', () => {
  test('patches model and library caches when a newer DTO arrives from another tab', async () => {
    const { handleModelSyncEvent } = await import('@/features/rsmodel/backend/model-sync-handler');
    const { createMinimalRSModelDTO } = await import('@/backend/test/sync-fixtures');
    const client = new QueryClient();
    const modelKey = KEYS.composite.model({ itemID: 1 });
    const stale = createMinimalRSModelDTO({ id: 1, time_update: '2020-01-01T00:00:00Z', title: 'Old title' });
    const fresh = createMinimalRSModelDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'New title' });

    client.setQueryData(modelKey, stale);
    client.setQueryData(KEYS.composite.libraryList, [{ id: 1, time_update: stale.time_update }]);
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleModelSyncEvent({ sourceId: 'other-tab', itemID: 1, data: fresh }, client);

    expect(client.getQueryData<RSModelDTO>(modelKey)?.title).toBe('New title');
    expect(client.getQueryData(KEYS.composite.libraryList)).toEqual([{ id: 1, time_update: fresh.time_update }]);
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: KEYS.composite.model({ itemID: 1 }),
      exact: true
    });
  });

  test('seeds model cache when a newer DTO arrives on an uncached tab', async () => {
    const { handleModelSyncEvent } = await import('@/features/rsmodel/backend/model-sync-handler');
    const { createMinimalRSModelDTO } = await import('@/backend/test/sync-fixtures');
    const client = new QueryClient();
    const modelKey = KEYS.composite.model({ itemID: 1 });
    const fresh = createMinimalRSModelDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'From other tab' });

    handleModelSyncEvent({ sourceId: 'other-tab', itemID: 1, data: fresh }, client);

    expect(client.getQueryData<RSModelDTO>(modelKey)?.title).toBe('From other tab');
  });

  test('invalidates when an older DTO arrives from another tab', async () => {
    const { handleModelSyncEvent } = await import('@/features/rsmodel/backend/model-sync-handler');
    const { createMinimalRSModelDTO } = await import('@/backend/test/sync-fixtures');
    const client = new QueryClient();
    const modelKey = KEYS.composite.model({ itemID: 1 });
    const local = createMinimalRSModelDTO({ id: 1, time_update: '2020-01-02T00:00:00Z', title: 'Current title' });
    const stale = createMinimalRSModelDTO({ id: 1, time_update: '2020-01-01T00:00:00Z', title: 'Stale title' });

    client.setQueryData(modelKey, local);
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    handleModelSyncEvent({ sourceId: 'other-tab', itemID: 1, data: stale }, client);

    expect(client.getQueryData<RSModelDTO>(modelKey)?.title).toBe('Current title');
    await vi.waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: KEYS.composite.model({ itemID: 1 }),
        exact: true
      });
    });
  });
});
