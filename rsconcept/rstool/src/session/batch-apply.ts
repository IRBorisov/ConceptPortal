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
