import { LibraryItemType, type UpdateLibraryItemDTO } from '@/features/library/backend/types';
import {
  type Attribution,
  type AttributionTargetDTO,
  type ConstituentaBasicsDTO,
  type CreateConstituentaDTO,
  type MoveConstituentsDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from '@/features/rsform/backend/types';
import { CstType } from '@/features/rsform/models/rsform';
import { getCstTypePrefix, isBaseSet, isFunctional } from '@/features/rsform/models/rsform-api';
import { applyAliasMapping, extractGlobals, isSimpleExpression, splitTemplateDefinition } from '@/features/rslang/api';
import { type ConstituentaDataDTO, type ConstituentaValue, type RSModelDTO } from '@/features/rsmodel/backend/types';

import { Graph } from '@/models/graph';

import { assertModelSchemaInvariant, type SandboxBundle } from '../models/bundle';

function nowIso(): string {
  return new Date().toISOString();
}

function cloneBundle(bundle: SandboxBundle): SandboxBundle {
  return structuredClone(bundle);
}

function bumpBundle(bundle: SandboxBundle): void {
  const t = nowIso();
  bundle.meta.updatedAt = t;
  bundle.rsform.time_update = t;
  bundle.model.time_update = t;
}

type SandboxConstituenta = SandboxBundle['rsform']['items'][number];
type SandboxAttribution = SandboxBundle['rsform']['attribution'][number];

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

function applyMappingToConstituents(
  items: SandboxConstituenta[],
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

function buildFormalGraph(items: SandboxConstituenta[]): Graph<number> {
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

interface SandboxSemanticInfo {
  isSimple: boolean;
  isTemplate: boolean;
  parent: number;
  children: number[];
}

function buildSemanticInfo(items: SandboxConstituenta[]): {
  graph: Graph<number>;
  byId: Map<number, SandboxConstituenta>;
  byAlias: Map<string, SandboxConstituenta>;
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
  cst: SandboxConstituenta,
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
  cst: SandboxConstituenta,
  graph: Graph<number>,
  info: Map<number, SandboxSemanticInfo>,
  byId: Map<number, SandboxConstituenta>,
  byAlias: Map<string, SandboxConstituenta>
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
  cst: SandboxConstituenta,
  graph: Graph<number>,
  info: Map<number, SandboxSemanticInfo>,
  byId: Map<number, SandboxConstituenta>,
  byAlias: Map<string, SandboxConstituenta>
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

function needCheckHead(
  sources: Set<number>,
  head: string,
  byId: Map<number, SandboxConstituenta>
): boolean {
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

function sortStable(graph: Graph<number>, target: number[]): number[] {
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

export function offlineMoveConstituents(bundle: SandboxBundle, data: MoveConstituentsDTO): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const rsform = next.rsform;
  const ids = rsform.items.map(i => i.id);
  const movingSet = new Set(data.items);
  const rest = ids.filter(id => !movingSet.has(id));
  const block = ids.filter(id => movingSet.has(id));
  const moveTo = Math.max(0, Math.min(data.move_to, rest.length));
  const before = rest.slice(0, moveTo);
  const after = rest.slice(moveTo);
  const newOrder = [...before, ...block, ...after];
  const rowById = new Map(rsform.items.map(i => [i.id, i]));
  rsform.items = newOrder.map(id => {
    const row = rowById.get(id);
    if (!row) {
      throw new Error(`moveConstituents: missing id ${id}`);
    }
    return row;
  });
  bumpBundle(next);
  return next;
}

export function offlineRestoreOrder(bundle: SandboxBundle): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const items = next.rsform.items;
  if (items.length <= 1) {
    bumpBundle(next);
    return next;
  }

  const { graph, byId, info } = buildSemanticInfo(items);
  let ordered = items.filter(cst => cst.cst_type === CstType.BASE);
  ordered = ordered.concat(items.filter(cst => cst.cst_type === CstType.CONSTANT));
  ordered = ordered.concat(
    items.filter(cst => !ordered.includes(cst) && (graph.at(cst.id)?.inputs.length ?? 0) === 0)
  );

  const kernelIds = items
    .filter(cst =>
      cst.cst_type === CstType.STRUCTURED ||
      cst.cst_type === CstType.AXIOM ||
      byId.get(info.get(cst.id)?.parent ?? cst.id)?.cst_type === CstType.STRUCTURED
    )
    .map(cst => cst.id);
  const kernel = new Set<number>(kernelIds);
  for (const id of graph.expandAllInputs(kernelIds)) {
    kernel.add(id);
  }

  ordered = ordered.concat(items.filter(cst => !ordered.includes(cst) && kernel.has(cst.id)));
  ordered = ordered.concat(items.filter(cst => !ordered.includes(cst)));
  ordered = sortStable(graph, ordered.map(cst => cst.id)).map(id => byId.get(id)!).filter(Boolean);

  const result: SandboxConstituenta[] = [];
  const marked = new Set<number>();
  for (const cst of ordered) {
    if (marked.has(cst.id)) {
      continue;
    }
    result.push(cst);
    marked.add(cst.id);
    for (const childId of info.get(cst.id)?.children ?? []) {
      const child = ordered.find(item => item.id === childId);
      if (child && !marked.has(child.id)) {
        marked.add(child.id);
        result.push(child);
      }
    }
  }

  next.rsform.items = result;
  bumpBundle(next);
  return next;
}

export function offlineResetAliases(bundle: SandboxBundle): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const counts: Record<string, number> = {};
  const mapping: Record<string, string> = {};
  for (const value of Object.values(CstType)) {
    counts[value] = 1;
  }

  for (const cst of next.rsform.items) {
    const alias = `${getCstTypePrefix(cst.cst_type)}${counts[cst.cst_type]}`;
    counts[cst.cst_type] += 1;
    if (cst.alias !== alias) {
      mapping[cst.alias] = alias;
    }
  }

  applyMappingToConstituents(next.rsform.items, mapping, true);
  bumpBundle(next);
  return next;
}

export function offlineSubstituteConstituents(bundle: SandboxBundle, substitutions: { original: number; substitution: number; }[]): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  if (substitutions.length === 0) {
    return next;
  }

  const byId = new Map(next.rsform.items.map(cst => [cst.id, cst]));
  const mapping: Record<string, string> = {};
  const deleted = new Set<number>();
  for (const { original, substitution } of substitutions) {
    const originalCst = byId.get(original);
    const substitutionCst = byId.get(substitution);
    if (!originalCst || !substitutionCst) {
      throw new Error(`substituteConstituents: unknown constituenta ${original} -> ${substitution}`);
    }
    mapping[originalCst.alias] = substitutionCst.alias;
    deleted.add(original);
  }

  const origToSub = new Map<number, number>();
  for (const { original, substitution } of substitutions) {
    origToSub.set(original, substitution);
  }

  const updatedAttributions: SandboxAttribution[] = [];
  const seen = new Set<string>();
  for (const attr of next.rsform.attribution) {
    if (!origToSub.has(attr.container) && !origToSub.has(attr.attribute)) {
      const key = `${attr.container}:${attr.attribute}`;
      if (!seen.has(key)) {
        seen.add(key);
        updatedAttributions.push({ ...attr });
      }
      continue;
    }

    const containerID = origToSub.get(attr.container) ?? attr.container;
    const attributeID = origToSub.get(attr.attribute) ?? attr.attribute;
    if (containerID === attributeID) {
      continue;
    }
    const key = `${containerID}:${attributeID}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    updatedAttributions.push({
      container: containerID,
      attribute: attributeID
    });
  }
  next.rsform.attribution = updatedAttributions;

  next.rsform.items = next.rsform.items.filter(cst => !deleted.has(cst.id));
  next.model.items = next.model.items.filter(value => !deleted.has(value.id));

  applyMappingToConstituents(next.rsform.items, mapping, false);
  bumpBundle(next);
  return next;
}

export function offlineCreateConstituenta(
  bundle: SandboxBundle,
  data: CreateConstituentaDTO
): { bundle: SandboxBundle; newCst: ConstituentaBasicsDTO; } {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const rsform = next.rsform;

  const newId = next.meta.nextId;
  next.meta.nextId += 1;

  const newCst: ConstituentaBasicsDTO = {
    id: newId,
    alias: data.alias,
    convention: data.convention,
    crucial: data.crucial,
    cst_type: data.cst_type,
    definition_formal: data.definition_formal,
    definition_raw: data.definition_raw,
    definition_resolved: '',
    term_raw: data.term_raw,
    term_resolved: '',
    term_forms: structuredClone(data.term_forms)
  };

  if (data.insert_after === null || data.insert_after === undefined) {
    rsform.items.push(newCst);
  } else {
    const idx = rsform.items.findIndex(i => i.id === data.insert_after);
    const insertAt = idx === -1 ? rsform.items.length : idx + 1;
    rsform.items.splice(insertAt, 0, newCst);
  }

  bumpBundle(next);
  return { bundle: next, newCst };
}

export function offlineDeleteConstituents(bundle: SandboxBundle, deleted: number[]): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const del = new Set(deleted);
  const rsform = next.rsform;
  const model = next.model;

  rsform.items = rsform.items.filter(i => !del.has(i.id));
  rsform.attribution = rsform.attribution.filter(a => !del.has(a.container) && !del.has(a.attribute));
  rsform.inheritance = rsform.inheritance.filter(
    row => !del.has(row.child) && !del.has(row.parent)
  );

  model.items = model.items.filter(v => !del.has(v.id));

  bumpBundle(next);
  return next;
}

export function offlineUpdateConstituenta(bundle: SandboxBundle, data: UpdateConstituentaDTO): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const rsform = next.rsform;
  const ix = rsform.items.findIndex(i => i.id === data.target);
  if (ix === -1) {
    throw new Error(`updateConstituenta: unknown target ${data.target}`);
  }
  const row = rsform.items[ix];
  const patch = data.item_data;
  rsform.items[ix] = {
    ...row,
    ...(patch.alias !== undefined ? { alias: patch.alias } : {}),
    ...(patch.cst_type !== undefined ? { cst_type: patch.cst_type } : {}),
    ...(patch.crucial !== undefined ? { crucial: patch.crucial } : {}),
    ...(patch.convention !== undefined ? { convention: patch.convention } : {}),
    ...(patch.definition_formal !== undefined ? { definition_formal: patch.definition_formal } : {}),
    ...(patch.definition_raw !== undefined ? { definition_raw: patch.definition_raw } : {}),
    ...(patch.term_raw !== undefined ? { term_raw: patch.term_raw } : {}),
    ...(patch.term_forms !== undefined ? { term_forms: structuredClone(patch.term_forms) } : {})
  };
  bumpBundle(next);
  return next;
}

export function offlineUpdateCrucial(bundle: SandboxBundle, data: UpdateCrucialDTO): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const targets = new Set(data.target);
  next.rsform.items = next.rsform.items.map(row =>
    targets.has(row.id) ? { ...row, crucial: data.value } : row
  );
  bumpBundle(next);
  return next;
}

export function offlineCreateAttribution(bundle: SandboxBundle, attr: Attribution): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const exists = next.rsform.attribution.some(
    a => a.container === attr.container && a.attribute === attr.attribute
  );
  if (!exists) {
    next.rsform.attribution.push({ ...attr });
  }
  bumpBundle(next);
  return next;
}

export function offlineDeleteAttribution(bundle: SandboxBundle, attr: Attribution): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  next.rsform.attribution = next.rsform.attribution.filter(
    a => !(a.container === attr.container && a.attribute === attr.attribute)
  );
  bumpBundle(next);
  return next;
}

export function offlineClearAttributions(bundle: SandboxBundle, data: AttributionTargetDTO): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const t = data.target;
  next.rsform.attribution = next.rsform.attribution.filter(
    a => a.container !== t && a.attribute !== t
  );
  bumpBundle(next);
  return next;
}

export function offlineUpdateLibraryItem(bundle: SandboxBundle, data: UpdateLibraryItemDTO): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const t = nowIso();
  if (data.id === next.rsform.id && data.item_type === LibraryItemType.RSFORM) {
    Object.assign(next.rsform, {
      title: data.title,
      alias: data.alias,
      description: data.description,
      visible: data.visible,
      read_only: data.read_only,
      time_update: t
    });
  } else if (data.id === next.model.id && data.item_type === LibraryItemType.RSMODEL) {
    Object.assign(next.model, {
      title: data.title,
      alias: data.alias,
      description: data.description,
      visible: data.visible,
      read_only: data.read_only,
      time_update: t
    });
    const modelEntry = next.rsform.models.find(m => m.id === next.model.id);
    if (modelEntry) {
      modelEntry.alias = data.alias;
    }
  } else {
    throw new Error('updateLibraryItem: id does not match sandbox rsform or model');
  }
  next.meta.updatedAt = t;
  return next;
}

export function offlineSetModelItems(bundle: SandboxBundle, items: RSModelDTO['items']): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  next.model.items = structuredClone(items);
  bumpBundle(next);
  return next;
}

/** Merge value writes into {@link RSModelDTO.items} (payload matches API set-value). */
export function offlineApplySetCstValue(bundle: SandboxBundle, updates: ConstituentaDataDTO): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const byId = new Map(next.model.items.map(v => [v.id, v]));
  for (const u of updates) {
    const row: ConstituentaValue = {
      id: u.target,
      type: u.type,
      value: structuredClone(u.data)
    };
    byId.set(u.target, row);
  }
  next.model.items = next.model.items.map(v => byId.get(v.id) ?? v);
  for (const u of updates) {
    if (!next.model.items.some(v => v.id === u.target)) {
      next.model.items.push({
        id: u.target,
        type: u.type,
        value: structuredClone(u.data)
      });
    }
  }
  bumpBundle(next);
  return next;
}

export function offlineClearModelValues(bundle: SandboxBundle, cstIDs: number[]): SandboxBundle {
  assertModelSchemaInvariant(bundle);
  const next = cloneBundle(bundle);
  const drop = new Set(cstIDs);
  next.model.items = next.model.items.filter(v => !drop.has(v.id));
  bumpBundle(next);
  return next;
}
