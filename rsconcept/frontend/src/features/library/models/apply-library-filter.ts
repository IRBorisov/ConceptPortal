import { matchLibraryItem, matchLibraryItemLocation } from '@/services/search';
import { type LibraryItem } from '@rsconcept/domain/library';

import { type LibraryContextSearchPhase } from './library-context-search';
import { type LibraryFilter } from './library-filter';

export interface LibraryContextRestriction {
  phase: LibraryContextSearchPhase;
  matchIds: number[] | null;
}

export function applyLibraryFilter(
  items: readonly LibraryItem[],
  filter: LibraryFilter,
  user: { id: number | null; editor: readonly number[] },
  context: LibraryContextRestriction
): LibraryItem[] {
  let result = items.slice();
  if (filter.folderMode && filter.location) {
    if (filter.subfolders) {
      result = result.filter(
        item => item.location == filter.location || item.location.startsWith(filter.location + '/')
      );
    } else {
      result = result.filter(item => item.location == filter.location);
    }
  }
  if (filter.isVisible !== null) {
    result = result.filter(item => filter.isVisible === item.visible);
  }
  if (filter.isOwned !== null) {
    result = result.filter(item => filter.isOwned === (item.owner === user.id));
  }
  if (filter.isEditor !== null) {
    result = result.filter(item => filter.isEditor == user.editor.includes(item.id));
  }
  if (filter.filterUser !== null) {
    result = result.filter(item => filter.filterUser === item.owner);
  }
  if (filter.itemType !== null) {
    result = result.filter(item => item.item_type === filter.itemType);
  }
  if (!filter.folderMode && !!filter.path) {
    result = result.filter(item => matchLibraryItemLocation(item, filter.path));
  }
  if (filter.query) {
    if (filter.searchMode === 'context') {
      if (context.phase !== 'idle') {
        const matches = new Set(context.matchIds ?? []);
        result = result.filter(item => matches.has(item.id));
      }
    } else {
      result = result.filter(item => matchLibraryItem(item, filter.query));
    }
  }

  return result;
}
