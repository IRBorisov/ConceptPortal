import { describe, expect, it } from 'vitest';

import { AccessPolicy, type LibraryItem, LibraryItemType, LocationHead } from '@/domain/library';

import { matchLibraryItem } from './library-search';

describe('Testing matching LibraryItem', () => {
  const item1: LibraryItem = {
    id: 42,
    item_type: LibraryItemType.RSFORM,
    title: 'Item1',
    alias: 'I1',
    description: 'description',
    time_create: 'I2',
    time_update: '',
    owner: null,
    access_policy: AccessPolicy.PUBLIC,
    location: LocationHead.COMMON,
    read_only: false,
    visible: true
  };

  const itemEmpty: LibraryItem = {
    id: -1,
    item_type: LibraryItemType.RSFORM,
    title: '',
    alias: '',
    description: '',
    time_create: '',
    time_update: '',
    owner: null,
    access_policy: AccessPolicy.PUBLIC,
    location: LocationHead.COMMON,
    read_only: false,
    visible: true
  };

  it('empty input', () => {
    expect(matchLibraryItem(itemEmpty, '')).toEqual(true);
    expect(matchLibraryItem(itemEmpty, '12')).toEqual(false);
    expect(matchLibraryItem(itemEmpty, ' ')).toEqual(false);
  });

  it('regular input', () => {
    expect(matchLibraryItem(item1, item1.title)).toEqual(true);
    expect(matchLibraryItem(item1, item1.alias)).toEqual(true);
    expect(matchLibraryItem(item1, item1.title + '@invalid')).toEqual(false);
    expect(matchLibraryItem(item1, item1.alias + '@invalid')).toEqual(false);
    expect(matchLibraryItem(item1, item1.time_create)).toEqual(false);
    expect(matchLibraryItem(item1, item1.description)).toEqual(true);
  });
});
