import { describe, expect, it } from 'vitest';

import { FolderTree } from '@rsconcept/domain/library';

import {
  fromGroupedUserLocation,
  ownerFolderSegment,
  parseOwnerFolderSegment,
  prioritizeCurrentUserFolderGroups,
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

  it('puts the current user owner group first under /U', () => {
    const tree = new FolderTree();
    tree.addPath('/U/!u1/a', 0);
    tree.addPath('/U/!u9/b', 0);
    tree.addPath('/U/!u5/c', 0);
    tree.addPath('/S/shared', 0);

    const paths = prioritizeCurrentUserFolderGroups(tree.getTree(), 5).map(node => node.getPath());
    expect(paths).toEqual(['/U', '/U/!u5', '/U/!u5/c', '/U/!u1', '/U/!u1/a', '/U/!u9', '/U/!u9/b', '/S', '/S/shared']);
  });
});
