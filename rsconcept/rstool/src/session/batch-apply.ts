import { Graph } from '@rsconcept/domain/graph/graph';
import { extractGlobals } from '@rsconcept/domain/rslang/api';

import { type ConstituentaDraft, type ConstituentaState } from '../models';

/** Order drafts so suppliers are applied before dependents. */
export function orderDrafts(sessionItems: ConstituentaState[], drafts: ConstituentaDraft[]): ConstituentaDraft[] {
  const merged = new Map<number, ConstituentaDraft>();
  for (const item of sessionItems) {
    merged.set(item.id, {
      id: item.id,
      alias: item.alias,
      cstType: item.cstType,
      definitionFormal: item.definitionFormal
    });
  }
  for (const draft of drafts) {
    merged.set(draft.id, draft);
  }

  const graph = new Graph<number>();
  const aliasToId = new Map<string, number>();
  for (const [id, draft] of merged) {
    graph.addNode(id);
    aliasToId.set(draft.alias, id);
  }

  for (const [id, draft] of merged) {
    if (!draft.definitionFormal) {
      continue;
    }
    for (const alias of extractGlobals(draft.definitionFormal)) {
      const depId = aliasToId.get(alias);
      if (depId !== undefined && depId !== id) {
        graph.addEdge(depId, id);
      }
    }
  }

  const draftIds = new Set(drafts.map(draft => draft.id));
  const topoIds = graph.topologicalOrder().filter(id => draftIds.has(id));
  const seen = new Set(topoIds);
  const missing = drafts.filter(draft => !seen.has(draft.id)).map(draft => draft.id);

  const orderedIds = [...topoIds, ...missing];
  return orderedIds.map(id => drafts.find(draft => draft.id === id)!).filter(Boolean);
}

/**
 * Restore declaration order in session items after a batch apply.
 * Topological apply order is only needed for analysis; Portal JSON uses array order.
 */
export function reorderSessionItemsByDrafts(
  items: ConstituentaState[],
  drafts: ConstituentaDraft[],
  preBatchItemIds: ReadonlySet<number>
): void {
  if (drafts.length === 0 || items.length === 0) {
    return;
  }

  const draftIds = drafts.map(draft => draft.id);
  const draftIdSet = new Set(draftIds);
  const mentioned = items.filter(item => draftIdSet.has(item.id));
  if (mentioned.length === 0) {
    return;
  }

  const unmentioned = items.filter(item => !draftIdSet.has(item.id));
  if (unmentioned.length === 0) {
    const byId = new Map(items.map(item => [item.id, item]));
    items.splice(0, items.length, ...draftIds.map(id => byId.get(id)!));
    return;
  }

  const newDrafts = drafts.filter(draft => !preBatchItemIds.has(draft.id));
  if (newDrafts.length === 0) {
    return;
  }

  const newIds = new Set(newDrafts.map(draft => draft.id));
  const kept = items.filter(item => !newIds.has(item.id));
  const byId = new Map(items.map(item => [item.id, item]));
  items.splice(0, items.length, ...kept, ...newDrafts.map(draft => byId.get(draft.id)!));
}
