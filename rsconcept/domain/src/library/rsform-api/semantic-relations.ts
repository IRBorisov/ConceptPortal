/**
 * Semantic parent/children used when restoring constituent order.
 */

import { type Graph } from '../../graph';
import { extractGlobals, isSimpleExpression, splitTemplateDefinition } from '../../rslang/api';
import { CstType } from '../rsform';

import { isBaseSet, isFunctional } from './cst-type';
import { inferTemplate } from './expression';
import { type FormalOrderFields, type SemanticRelations } from './types';

/**
 * Infer semantic parent/children used for clustering during restore order.
 * Port of backend {@code SemanticInfo}.
 */
export function computeSemanticRelations(items: readonly FormalOrderFields[], graph: Graph<number>): SemanticRelations {
  const byId = new Map(items.map(cst => [cst.id, cst]));
  const byAlias = new Map(items.map(cst => [cst.alias, cst]));
  const isTemplate = new Map<number, boolean>();
  const isSimple = new Map<number, boolean>();
  const parentOf = new Map<number, number>();
  const childrenOf = new Map<number, number[]>();

  for (const cst of items) {
    parentOf.set(cst.id, cst.id);
    childrenOf.set(cst.id, []);
  }

  function needCheckHead(sources: Set<number>, head: string): boolean {
    if (sources.size === 0) {
      return true;
    }
    if (sources.size !== 1) {
      return false;
    }
    const base = byId.get([...sources][0])!;
    return !isFunctional(base.cst_type) || splitTemplateDefinition(base.definition_formal).head !== head;
  }

  function extractSources(target: FormalOrderFields): Set<number> {
    const sources = new Set<number>();
    if (!isFunctional(target.cst_type)) {
      for (const parentId of graph.at(target.id)?.inputs ?? []) {
        if (!(isTemplate.get(parentId) && isSimple.get(parentId))) {
          sources.add(parentOf.get(parentId) ?? parentId);
        }
      }
      return sources;
    }

    const expression = splitTemplateDefinition(target.definition_formal);
    for (const alias of extractGlobals(expression.body)) {
      const parent = byAlias.get(alias);
      if (!parent) {
        continue;
      }
      if (!(isTemplate.get(parent.id) && isSimple.get(parent.id))) {
        sources.add(parentOf.get(parent.id) ?? parent.id);
      }
    }
    if (needCheckHead(sources, expression.head)) {
      for (const alias of extractGlobals(expression.head)) {
        const parent = byAlias.get(alias);
        if (!parent) {
          continue;
        }
        if (!isBaseSet(parent.cst_type) && !(isTemplate.get(parent.id) && isSimple.get(parent.id))) {
          sources.add(parentOf.get(parent.id) ?? parent.id);
        }
      }
    }
    return sources;
  }

  function inferSimple(target: FormalOrderFields): boolean {
    if (target.cst_type === CstType.STRUCTURED || isBaseSet(target.cst_type)) {
      return false;
    }
    const dependencies = graph.at(target.id)?.inputs ?? [];
    if (dependencies.some(id => isTemplate.get(id) && !isSimple.get(id))) {
      return false;
    }
    const expression = isFunctional(target.cst_type)
      ? splitTemplateDefinition(target.definition_formal).body
      : target.definition_formal;
    return isSimpleExpression(expression);
  }

  for (const cstId of graph.topologicalOrder()) {
    const cst = byId.get(cstId);
    if (!cst) {
      continue;
    }
    isTemplate.set(cstId, inferTemplate(cst.definition_formal));
    isSimple.set(cstId, inferSimple(cst));
    if (!isSimple.get(cstId) || cst.cst_type === CstType.STRUCTURED) {
      continue;
    }
    const sources = extractSources(cst);
    if (sources.size !== 1) {
      continue;
    }
    const parentId = [...sources][0];
    const parent = byId.get(parentId);
    if (!parent || isBaseSet(parent.cst_type)) {
      continue;
    }
    parentOf.set(cstId, parentId);
    childrenOf.get(parentId)!.push(cstId);
  }

  return { parentOf, childrenOf };
}
