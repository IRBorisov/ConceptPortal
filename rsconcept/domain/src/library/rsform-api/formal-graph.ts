/**
 * Formal dependency graph and declaration-order restore for RSForm constituents.
 */

import { Graph } from '../../graph';
import { extractGlobals } from '../../rslang/api';
import { CstType } from '../rsform';

import { computeSemanticRelations } from './semantic-relations';
import { type FormalOrderFields, type SemanticRelations } from './types';

/**
 * Build the formal dependency graph: supplier → dependent.
 * Matches backend {@code RSForm.graph_formal}.
 */
export function buildFormalDependencyGraph(items: readonly FormalOrderFields[]): Graph<number> {
  const graph = new Graph<number>();
  const byAlias = new Map(items.map(cst => [cst.alias, cst]));
  for (const cst of items) {
    graph.addNode(cst.id);
  }
  for (const cst of items) {
    for (const alias of extractGlobals(cst.definition_formal)) {
      const supplier = byAlias.get(alias);
      if (supplier) {
        graph.addEdge(supplier.id, cst.id);
      }
    }
  }
  return graph;
}

/**
 * Reorder constituents: formal topology hard, semantic children sticky when ready,
 * otherwise stable against type/kernel preferred ranks.
 *
 * One Kahn pass over the formal dependency graph.
 */
export function restoreConstituentOrder<T extends FormalOrderFields>(
  items: readonly T[],
  graph: Graph<number> = buildFormalDependencyGraph(items),
  relations: SemanticRelations = computeSemanticRelations(items, graph)
): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const byId = new Map(items.map(cst => [cst.id, cst]));
  const preferred = kernelPriority(items, graph, relations.parentOf);
  const rank = new Map(preferred.map((cst, index) => [cst.id, index]));

  const remainingInputs = new Map<number, number>();
  for (const cst of preferred) {
    const inputs = graph.at(cst.id)?.inputs ?? [];
    remainingInputs.set(
      cst.id,
      inputs.reduce((count, src) => count + (rank.has(src) ? 1 : 0), 0)
    );
  }

  const ready = new Set<number>();
  for (const cst of preferred) {
    if ((remainingInputs.get(cst.id) ?? 0) === 0) {
      ready.add(cst.id);
    }
  }

  const children = new Map<number, number[]>();
  for (const cst of preferred) {
    children.set(
      cst.id,
      (relations.childrenOf.get(cst.id) ?? []).filter(childId => rank.has(childId))
    );
  }

  const result: T[] = [];
  const pendingChildren: number[] = [];

  function enqueueSticky(candidateIds: readonly number[]): void {
    const sticky = candidateIds.filter(childId => ready.has(childId) && !pendingChildren.includes(childId));
    sticky.sort((left, right) => (rank.get(left) ?? 0) - (rank.get(right) ?? 0));
    pendingChildren.push(...sticky);
  }

  function pickReady(): number {
    while (pendingChildren.length > 0) {
      const childId = pendingChildren.shift()!;
      if (ready.has(childId)) {
        return childId;
      }
    }
    let best = -1;
    let bestRank = Number.POSITIVE_INFINITY;
    for (const nodeId of ready) {
      const nodeRank = rank.get(nodeId) ?? Number.POSITIVE_INFINITY;
      if (nodeRank < bestRank) {
        best = nodeId;
        bestRank = nodeRank;
      }
    }
    return best;
  }

  while (ready.size > 0 || pendingChildren.length > 0) {
    if (ready.size === 0) {
      pendingChildren.length = 0;
      continue;
    }
    const nodeId = pickReady();
    ready.delete(nodeId);
    result.push(byId.get(nodeId)!);

    for (const dependentId of graph.at(nodeId)?.outputs ?? []) {
      if (!remainingInputs.has(dependentId)) {
        continue;
      }
      const next = (remainingInputs.get(dependentId) ?? 0) - 1;
      remainingInputs.set(dependentId, next);
      if (next === 0) {
        ready.add(dependentId);
      }
    }

    enqueueSticky(children.get(nodeId) ?? []);
  }

  if (result.length < preferred.length) {
    const placed = new Set(result.map(cst => cst.id));
    for (const cst of preferred) {
      if (!placed.has(cst.id)) {
        result.push(cst);
      }
    }
  }

  return result;
}

function kernelPriority<T extends FormalOrderFields>(
  items: readonly T[],
  graph: Graph<number>,
  parentOf: Map<number, number>
): T[] {
  const byId = new Map(items.map(cst => [cst.id, cst]));
  const seen = new Set<number>();
  const result: T[] = [];

  function push(cst: T): void {
    if (seen.has(cst.id)) {
      return;
    }
    seen.add(cst.id);
    result.push(cst);
  }

  for (const cst of items) {
    if (cst.cst_type === CstType.BASE) {
      push(cst);
    }
  }
  for (const cst of items) {
    if (cst.cst_type === CstType.CONSTANT) {
      push(cst);
    }
  }
  for (const cst of items) {
    if ((graph.at(cst.id)?.inputs.length ?? 0) === 0) {
      push(cst);
    }
  }

  const kernelSeeds = items
    .filter(cst => {
      const parentId = parentOf.get(cst.id) ?? cst.id;
      const parent = byId.get(parentId);
      return (
        cst.cst_type === CstType.STRUCTURED || cst.cst_type === CstType.AXIOM || parent?.cst_type === CstType.STRUCTURED
      );
    })
    .map(cst => cst.id);
  const kernel = new Set<number>([...kernelSeeds, ...graph.expandAllInputs(kernelSeeds)]);
  for (const cst of items) {
    if (kernel.has(cst.id)) {
      push(cst);
    }
  }
  for (const cst of items) {
    push(cst);
  }
  return result;
}
