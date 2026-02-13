import { FolderTree } from '../models/folder-tree';
import { LocationHead } from '../models/library';

import { useLibrary } from './use-library';

export function useFolders() {
  const { items } = useLibrary();
  const result = new FolderTree();
  result.addPath(LocationHead.USER, 0);
  result.addPath(LocationHead.COMMON, 0);
  result.addPath(LocationHead.LIBRARY, 0);
  result.addPath(LocationHead.PROJECTS, 0);
  for (const item of items) {
    result.addPath(item.location);
  }
  return { folders: result };
}
