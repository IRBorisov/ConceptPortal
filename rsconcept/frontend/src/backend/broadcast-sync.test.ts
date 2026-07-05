import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { notifyAuthSync, subscribeAuthSync } from '@/features/auth/backend/auth-sync';
import { LIBRARY_SYNC_CHANNEL, notifyLibrarySync, subscribeLibrarySync } from '@/features/library/backend/library-sync';
import { isOssSyncDto, subscribeOssSync } from '@/features/oss/backend/oss-sync';
import { isSchemaSyncDto, notifySchemaSync, subscribeSchemaSync } from '@/features/rsform/backend/schema-sync';
import { isModelSyncDto, notifyModelSync, subscribeModelSync } from '@/features/rsmodel/backend/model-sync';

import { TAB_SOURCE_ID } from '@/backend/item-sync-utils';
import {
  installMockBroadcastChannel,
  MockBroadcastChannel,
  uninstallMockBroadcastChannel
} from '@/backend/test/mock-broadcast-channel';
import { createMinimalOssDTO, createMinimalRSFormDTO, createMinimalRSModelDTO } from '@/backend/test/sync-fixtures';

const OTHER_TAB_ID = 'other-tab-id';

describe('broadcast sync channels', () => {
  beforeEach(() => {
    installMockBroadcastChannel();
  });

  afterEach(() => {
    uninstallMockBroadcastChannel();
  });

  describe('auth sync', () => {
    test('notify does not deliver to the same tab', () => {
      const listener = vi.fn();
      subscribeAuthSync(listener);

      notifyAuthSync('login');

      expect(listener).not.toHaveBeenCalled();
    });

    test('subscriber receives login and logout from another tab', () => {
      const listener = vi.fn();
      subscribeAuthSync(listener);

      MockBroadcastChannel.deliverToAll('portal-auth-sync', { sourceId: OTHER_TAB_ID, event: 'login' });
      MockBroadcastChannel.deliverToAll('portal-auth-sync', { sourceId: OTHER_TAB_ID, event: 'logout' });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, 'login');
      expect(listener).toHaveBeenNthCalledWith(2, 'logout');
    });

    test('ignores malformed and self-originated messages', () => {
      const listener = vi.fn();
      subscribeAuthSync(listener);

      MockBroadcastChannel.deliverToAll('portal-auth-sync', { sourceId: TAB_SOURCE_ID, event: 'login' });
      MockBroadcastChannel.deliverToAll('portal-auth-sync', { sourceId: OTHER_TAB_ID, event: 'unknown' });
      MockBroadcastChannel.deliverToAll('portal-auth-sync', null);

      expect(listener).not.toHaveBeenCalled();
    });

    test('unsubscribe stops delivery', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeAuthSync(listener);
      unsubscribe();

      MockBroadcastChannel.deliverToAll('portal-auth-sync', { sourceId: OTHER_TAB_ID, event: 'login' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('library sync', () => {
    test('notify does not deliver to the same tab', () => {
      const listener = vi.fn();
      subscribeLibrarySync(listener);

      notifyLibrarySync();

      expect(listener).not.toHaveBeenCalled();
    });

    test('subscriber receives library-wide refresh from another tab', () => {
      const listener = vi.fn();
      subscribeLibrarySync(listener);

      MockBroadcastChannel.deliverToAll(LIBRARY_SYNC_CHANNEL, { sourceId: OTHER_TAB_ID });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('schema sync', () => {
    test('notify delivers DTO payload to another tab', () => {
      const listener = vi.fn();
      subscribeSchemaSync(listener);
      const data = createMinimalRSFormDTO({ id: 7, time_update: '2020-01-02T00:00:00Z' });

      notifySchemaSync(7, data);
      MockBroadcastChannel.deliverToAll('portal-schema-sync', {
        sourceId: OTHER_TAB_ID,
        itemID: 7,
        data
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ sourceId: OTHER_TAB_ID, itemID: 7, data });
    });

    test('subscriber receives refetch-only events without data', () => {
      const listener = vi.fn();
      subscribeSchemaSync(listener);

      MockBroadcastChannel.deliverToAll('portal-schema-sync', { sourceId: OTHER_TAB_ID, itemID: 9 });

      expect(listener).toHaveBeenCalledWith({ sourceId: OTHER_TAB_ID, itemID: 9 });
    });
  });

  describe('oss sync', () => {
    test('subscriber receives validated OSS payload from another tab', () => {
      const listener = vi.fn();
      subscribeOssSync(listener);
      const data = createMinimalOssDTO({ id: 5, time_update: '2020-01-02T00:00:00Z' });

      MockBroadcastChannel.deliverToAll('portal-oss-sync', { sourceId: OTHER_TAB_ID, itemID: 5, data });

      expect(listener).toHaveBeenCalledWith({ sourceId: OTHER_TAB_ID, itemID: 5, data });
    });
  });

  describe('model sync', () => {
    test('subscriber receives model payload from another tab', () => {
      const listener = vi.fn();
      subscribeModelSync(listener);
      const data = createMinimalRSModelDTO({ id: 4, time_update: '2020-01-02T00:00:00Z' });

      MockBroadcastChannel.deliverToAll('portal-model-sync', { sourceId: OTHER_TAB_ID, itemID: 4, data });

      expect(listener).toHaveBeenCalledWith({ sourceId: OTHER_TAB_ID, itemID: 4, data });
    });

    test('notify does not deliver to the same tab', () => {
      const listener = vi.fn();
      subscribeModelSync(listener);
      const data = createMinimalRSModelDTO();

      notifyModelSync(data.id, data);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('sync DTO guards', () => {
  test('isSchemaSyncDto validates and normalizes RSForm payloads', () => {
    const data = createMinimalRSFormDTO({ id: 2, time_update: '2020-01-02T00:00:00Z' });
    const event = { sourceId: OTHER_TAB_ID, itemID: 2, data };

    expect(isSchemaSyncDto(event)).toBe(true);
    expect(event.data).toEqual(data);
  });

  test('isSchemaSyncDto rejects id mismatch and invalid payloads', () => {
    const valid = createMinimalRSFormDTO({ id: 2 });
    expect(isSchemaSyncDto({ sourceId: OTHER_TAB_ID, itemID: 99, data: valid })).toBe(false);
    expect(isSchemaSyncDto({ sourceId: OTHER_TAB_ID, itemID: 2, data: { id: 2 } as never })).toBe(false);
    expect(isSchemaSyncDto({ sourceId: OTHER_TAB_ID, itemID: 2 })).toBe(false);
  });

  test('isOssSyncDto validates and normalizes OSS payloads', () => {
    const data = createMinimalOssDTO({ id: 8 });
    const event = { sourceId: OTHER_TAB_ID, itemID: 8, data };

    expect(isOssSyncDto(event)).toBe(true);
    expect(event.data).toEqual(data);
  });

  test('isOssSyncDto rejects invalid payloads', () => {
    const data = createMinimalOssDTO({ id: 8 });
    expect(isOssSyncDto({ sourceId: OTHER_TAB_ID, itemID: 1, data })).toBe(false);
  });

  test('isModelSyncDto validates and normalizes model payloads', () => {
    const data = createMinimalRSModelDTO({ id: 6 });
    const event = { sourceId: OTHER_TAB_ID, itemID: 6, data };

    expect(isModelSyncDto(event)).toBe(true);
    expect(event.data).toEqual(data);
  });

  test('isModelSyncDto rejects invalid payloads', () => {
    const data = createMinimalRSModelDTO({ id: 6 });
    expect(isModelSyncDto({ sourceId: OTHER_TAB_ID, itemID: 1, data })).toBe(false);
  });
});

describe('broadcast sync without BroadcastChannel', () => {
  beforeEach(() => {
    uninstallMockBroadcastChannel();
    vi.stubGlobal('BroadcastChannel', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    installMockBroadcastChannel();
  });

  test('notify and subscribe are no-ops when BroadcastChannel is unavailable', () => {
    const authListener = vi.fn();
    const libraryListener = vi.fn();
    const authUnsubscribe = subscribeAuthSync(authListener);
    const libraryUnsubscribe = subscribeLibrarySync(libraryListener);

    notifyAuthSync('login');
    notifyLibrarySync();

    expect(authListener).not.toHaveBeenCalled();
    expect(libraryListener).not.toHaveBeenCalled();
    expect(authUnsubscribe).not.toThrow();
    expect(libraryUnsubscribe).not.toThrow();
  });
});
