import { describe, expect, it } from 'vitest';

import {
  fromGroupedUserLocation,
  ownerFolderSegment,
  parseOwnerFolderSegment,
  toGroupedUserLocation
} from './user-folder-group';

describe('user-folder-group', () => {
  it('encodes and parses owner segments', () => {
    expect(ownerFolderSegment(42)).toBe('!u42');
    expect(parseOwnerFolderSegment('!u42')).toBe(42);
    expect(parseOwnerFolderSegment('folder')).toBeNull();
  });

  it('builds grouped tree paths under /U', () => {
    expect(toGroupedUserLocation('/U', 7)).toBe('/U/!u7');
    expect(toGroupedUserLocation('/U/work', 7)).toBe('/U/!u7/work');
    expect(toGroupedUserLocation('/S/work', 7)).toBe('/S/work');
    expect(toGroupedUserLocation('/U/work', null)).toBe('/U/work');
  });

  it('strips virtual owner segments', () => {
    expect(fromGroupedUserLocation('/U/!u7')).toEqual({ location: '/U', ownerId: 7 });
    expect(fromGroupedUserLocation('/U/!u7/work/a')).toEqual({ location: '/U/work/a', ownerId: 7 });
    expect(fromGroupedUserLocation('/U/work')).toEqual({ location: '/U/work', ownerId: null });
    expect(fromGroupedUserLocation('/S/work')).toEqual({ location: '/S/work', ownerId: null });
  });
});
