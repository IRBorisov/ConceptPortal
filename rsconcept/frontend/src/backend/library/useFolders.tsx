import { FolderTree } from '@/models/FolderTree';
import { LocationHead } from '@/models/library';

import { useLibrary } from './useLibrary';

export function useFolders() {
  const { items } = useLibrary();

  const result = new FolderTree();
  result.addPath(LocationHead.USER, 0);
  result.addPath(LocationHead.COMMON, 0);
  result.addPath(LocationHead.LIBRARY, 0);
  result.addPath(LocationHead.PROJECTS, 0);
  items.forEach(item => result.addPath(item.location));

  return { folders: result };
}
