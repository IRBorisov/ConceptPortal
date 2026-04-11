import { CstType } from '@/features/rsform';
import { type ConstituentaBasicsDTO } from '@/features/rsform/backend/types';
import { isBaseSet, isFunctional } from '@/features/rsform/models/rsform-api';
import { applyAliasMapping, extractGlobals, isSimpleExpression, splitTemplateDefinition } from '@/features/rslang/api';

import { Graph } from '@/models/graph';

import { type SandboxSemanticInfo } from './semantic-info';

export function applyMappingToConstituents(
  items: ConstituentaBasicsDTO[],
  mapping: Record<string, string>,
  changeAliases: boolean
): void {
  for (const cst of items) {
    if (changeAliases && cst.alias in mapping) {
      cst.alias = mapping[cst.alias];
    }
    cst.definition_formal = applyAliasMapping(cst.definition_formal, mapping);
    cst.term_raw = replaceEntities(cst.term_raw, mapping);
    cst.definition_raw = replaceEntities(cst.definition_raw, mapping);
  }
}

export function sortStable(graph: Graph<number>, target: number[]): number[] {
  if (target.length <= 1) {
    return [...target];
  }

  const reachable = buildTransitiveClosure(graph);
  const testSet = new Set<number>();
  const result: number[] = [];

  for (const nodeId of [...target].reverse()) {
    const nodeReachable = reachable.get(nodeId) ?? new Set<number>();
    const needMove = testSet.has(nodeId);
    for (const childId of nodeReachable) {
      testSet.add(childId);
    }

    if (!needMove) {
      result.push(nodeId);
      continue;
    }

    let inserted = false;
    for (let index = 0; index < result.length; index++) {
      const parent = result[index];
      const parentReachable = reachable.get(parent) ?? new Set<number>();
      if (nodeReachable.has(parent)) {
        if (parentReachable.has(nodeId)) {
          result.push(nodeId);
        } else {
          result.splice(index, 0, nodeId);
        }
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      result.push(nodeId);
    }
  }

  result.reverse();
  return result;
}

function buildFormalGraph(items: ConstituentaBasicsDTO[]): Graph<number> {
  const graph = new Graph<number>();
  const byAlias = new Map(items.map(cst => [cst.alias, cst]));
  for (const cst of items) {
    graph.addNode(cst.id);
  }
  for (const cst of items) {
    for (const alias of extractGlobals(cst.definition_formal)) {
      const child = byAlias.get(alias);
      if (child) {
        graph.addEdge(child.id, cst.id);
      }
    }
  }
  return graph;
}

export function buildSemanticInfo(items: ConstituentaBasicsDTO[]): {
  graph: Graph<number>;
  byId: Map<number, ConstituentaBasicsDTO>;
  byAlias: Map<string, ConstituentaBasicsDTO>;
  info: Map<number, SandboxSemanticInfo>;
} {
  const graph = buildFormalGraph(items);
  const byId = new Map(items.map(cst => [cst.id, cst]));
  const byAlias = new Map(items.map(cst => [cst.alias, cst]));
  const info = new Map<number, SandboxSemanticInfo>();

  for (const cst of items) {
    info.set(cst.id, {
      isSimple: false,
      isTemplate: false,
      parent: cst.id,
      children: []
    });
  }

  for (const cstId of graph.topologicalOrder()) {
    const cst = byId.get(cstId);
    const current = info.get(cstId);
    if (!cst || !current) {
      continue;
    }
    current.isTemplate = /R\d+/.test(cst.definition_formal);
    current.isSimple = inferSimpleExpression(cst, graph, info);
    if (!current.isSimple || cst.cst_type === CstType.STRUCTURED) {
      continue;
    }
    const parent = inferParent(cst, graph, info, byId, byAlias);
    current.parent = parent;
    if (parent !== cst.id) {
      info.get(parent)?.children.push(cst.id);
    }
  }

  return { graph, byId, byAlias, info };
}

function inferSimpleExpression(
  cst: ConstituentaBasicsDTO,
  graph: Graph<number>,
  info: Map<number, SandboxSemanticInfo>
): boolean {
  if (cst.cst_type === CstType.STRUCTURED || isBaseSet(cst.cst_type)) {
    return false;
  }

  const dependencies = graph.at(cst.id)?.inputs ?? [];
  const hasComplexDependency = dependencies.some(depID => {
    const depInfo = info.get(depID);
    return !!depInfo?.isTemplate && !depInfo.isSimple;
  });
  if (hasComplexDependency) {
    return false;
  }

  if (isFunctional(cst.cst_type)) {
    return isSimpleExpression(splitTemplateDefinition(cst.definition_formal).body);
  }
  return isSimpleExpression(cst.definition_formal);
}

function inferParent(
  cst: ConstituentaBasicsDTO,
  graph: Graph<number>,
  info: Map<number, SandboxSemanticInfo>,
  byId: Map<number, ConstituentaBasicsDTO>,
  byAlias: Map<string, ConstituentaBasicsDTO>
): number {
  const sources = extractSources(cst, graph, info, byId, byAlias);
  if (sources.size !== 1) {
    return cst.id;
  }

  const parentId = [...sources][0];
  const parent = byId.get(parentId);
  if (!parent || isBaseSet(parent.cst_type)) {
    return cst.id;
  }
  return parentId;
}

function extractSources(
  cst: ConstituentaBasicsDTO,
  graph: Graph<number>,
  info: Map<number, SandboxSemanticInfo>,
  byId: Map<number, ConstituentaBasicsDTO>,
  byAlias: Map<string, ConstituentaBasicsDTO>
): Set<number> {
  const sources = new Set<number>();
  if (!isFunctional(cst.cst_type)) {
    for (const parentId of graph.at(cst.id)?.inputs ?? []) {
      const parentInfo = info.get(parentId);
      if (!parentInfo?.isTemplate || !parentInfo.isSimple) {
        sources.add(parentInfo?.parent ?? parentId);
      }
    }
    return sources;
  }

  const expression = splitTemplateDefinition(cst.definition_formal);
  const bodyDependencies = extractGlobals(expression.body);
  for (const alias of bodyDependencies) {
    const parent = byAlias.get(alias);
    if (!parent) {
      continue;
    }
    const parentInfo = info.get(parent.id);
    if (!parentInfo?.isTemplate || !parentInfo.isSimple) {
      sources.add(parentInfo?.parent ?? parent.id);
    }
  }

  if (needCheckHead(sources, expression.head, byId)) {
    const headDependencies = extractGlobals(expression.head);
    for (const alias of headDependencies) {
      const parent = byAlias.get(alias);
      if (!parent || isBaseSet(parent.cst_type)) {
        continue;
      }
      const parentInfo = info.get(parent.id);
      if (!parentInfo?.isTemplate || !parentInfo.isSimple) {
        sources.add(parentInfo?.parent ?? parent.id);
      }
    }
  }

  return sources;
}

function needCheckHead(sources: Set<number>, head: string, byId: Map<number, ConstituentaBasicsDTO>): boolean {
  if (sources.size === 0) {
    return true;
  }
  if (sources.size !== 1) {
    return false;
  }

  const base = byId.get([...sources][0]);
  if (!base) {
    return true;
  }
  return !isFunctional(base.cst_type) || splitTemplateDefinition(base.definition_formal).head !== head;
}

function buildTransitiveClosure(graph: Graph<number>): Map<number, Set<number>> {
  const closure = new Map<number, Set<number>>();
  for (const node of graph.nodes.values()) {
    closure.set(node.id, new Set(node.outputs));
  }

  const order = graph.topologicalOrder();
  for (const nodeId of [...order].reverse()) {
    const node = graph.at(nodeId);
    if (!node) {
      continue;
    }
    const nodeClosure = closure.get(nodeId) ?? new Set<number>();
    for (const parentId of node.inputs) {
      const parentClosure = closure.get(parentId) ?? new Set<number>();
      for (const childId of nodeClosure) {
        parentClosure.add(childId);
      }
      closure.set(parentId, parentClosure);
    }
  }

  return closure;
}

// ====== Internals ======

function replaceEntities(text: string, mapping: Record<string, string>): string {
  if (text === '') {
    return text;
  }

  const pattern = /@{([^0-9\-].*?)\|.*?}/g;
  let posInput = 0;
  let output = '';
  for (const segment of text.matchAll(pattern)) {
    const entity = segment[1];
    const start = segment.index ?? 0;
    if (entity in mapping) {
      output += text.substring(posInput, start + 2);
      output += mapping[entity];
      output += text.substring(start + 2 + entity.length, start + segment[0].length);
      posInput = start + segment[0].length;
    }
  }
  output += text.substring(posInput, text.length);
  return output;
}
