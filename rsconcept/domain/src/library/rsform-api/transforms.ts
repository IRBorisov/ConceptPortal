/**
 * Pure constituenta list transforms: reorder, move, insert position.
 */

/** Rebuild an item list following {@link orderedIds}. Throws if an id is missing. */
export function reorderItemsByIds<T extends { id: number }>(items: readonly T[], orderedIds: readonly number[]): T[] {
  const byId = new Map(items.map(item => [item.id, item]));
  return orderedIds.map(id => {
    const item = byId.get(id);
    if (!item) {
      throw new Error(`reorderItemsByIds: missing id ${id}`);
    }
    return item;
  });
}

/**
 * Move a subset of ids within an ordered id list.
 * {@link moveTo} is clamped to `[0, rest.length]` (index among non-moving items).
 */
export function moveIdsInOrder(ids: readonly number[], moving: readonly number[], moveTo: number): number[] {
  const movingSet = new Set(moving);
  const rest = ids.filter(id => !movingSet.has(id));
  const movingItems = ids.filter(id => movingSet.has(id));
  const clamped = Math.max(0, Math.min(moveTo, rest.length));
  return [...rest.slice(0, clamped), ...movingItems, ...rest.slice(clamped)];
}

/** Insert {@link item} after {@link insertAfter}, or append when null/undefined/missing. Mutates {@link items}. */
export function insertItemAfter<T extends { id: number }>(
  items: T[],
  item: T,
  insertAfter: number | null | undefined
): void {
  if (insertAfter === null || insertAfter === undefined) {
    items.push(item);
    return;
  }
  const idx = items.findIndex(row => row.id === insertAfter);
  const insertAt = idx === -1 ? items.length : idx + 1;
  items.splice(insertAt, 0, item);
}
