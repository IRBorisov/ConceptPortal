import { LibraryItemType } from '@/domain/library';
import { type Attribution, CstType, type RSForm, type Substitution } from '@/domain/library/rsform';
import { getCstTypePrefix } from '@/domain/library/rsform-api';

import { type UpdateLibraryItemDTO } from '@/features/library/backend/types';
import {
  type AttributionTargetDTO,
  type ConstituentaBasicsDTO,
  type CreateConstituentaDTO,
  type InlineSynthesisDTO,
  type MoveConstituentsDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from '@/features/rsform/backend/types';
import { type ConstituentaDataDTO, type ConstituentaValue, type RSModelDTO } from '@/features/rsmodel/backend/types';

import { nowIso } from '@/utils/format';

import { type SandboxBundle } from '../models/bundle';
import { bumpBundle, cloneBundle } from '../models/bundle-api';
import { applyMappingToConstituents } from '../models/mutations-api';
import { resolveAllConstituentTexts, resolveConstituentTextChange } from '../models/text-resolution';

/** Sandbox mutations API. */
export const sbApi = {
  moveConstituents,
  restoreOrder,
  resetAliases,
  substituteConstituents,
  inlineSynthesis,
  createConstituenta,
  deleteConstituents,
  updateConstituenta,
  updateCrucial,
  createAttribution,
  deleteAttribution,
  clearAttributions,
  updateLibraryItem,
  setModelItems,
  applySetCstValue,
  clearModelValues
};

function moveConstituents(bundle: SandboxBundle, data: MoveConstituentsDTO): SandboxBundle {
  const next = cloneBundle(bundle);
  const cstIDs = next.schema.items.map(cst => cst.id);
  const movingIDs = new Set(data.items);
  const rest = cstIDs.filter(id => !movingIDs.has(id));
  const movingItems = cstIDs.filter(id => movingIDs.has(id));
  const moveTo = Math.max(0, Math.min(data.move_to, rest.length));
  const newOrder = [...rest.slice(0, moveTo), ...movingItems, ...rest.slice(moveTo)];
  const cstById = new Map(next.schema.items.map(cst => [cst.id, cst]));
  next.schema.items = newOrder.map(id => {
    const cst = cstById.get(id);
    if (!cst) {
      throw new Error(`moveConstituents: missing id ${id}`);
    }
    return cst;
  });
  bumpBundle(next);
  return next;
}

function restoreOrder(bundle: SandboxBundle, schema: RSForm): SandboxBundle {
  const next = cloneBundle(bundle);
  const items = next.schema.items;
  if (items.length <= 1) {
    bumpBundle(next);
    return next;
  }

  const graph = schema.graph;
  const itemById = new Map(items.map(cst => [cst.id, cst]));

  let ordered = items.filter(cst => cst.cst_type === CstType.BASE);
  ordered = ordered.concat(items.filter(cst => cst.cst_type === CstType.CONSTANT));
  ordered = ordered.concat(items.filter(cst => !ordered.includes(cst) && (graph.at(cst.id)?.inputs.length ?? 0) === 0));

  const kernelIds = items
    .filter(cst => {
      const meta = schema.cstByID.get(cst.id);
      const parentId = meta?.spawner ?? cst.id;
      const parent = schema.cstByID.get(parentId);
      return (
        cst.cst_type === CstType.STRUCTURED || cst.cst_type === CstType.AXIOM || parent?.cst_type === CstType.STRUCTURED
      );
    })
    .map(cst => cst.id);
  const kernel = new Set<number>(kernelIds);
  for (const id of graph.expandAllInputs(kernelIds)) {
    kernel.add(id);
  }

  ordered = ordered.concat(items.filter(cst => !ordered.includes(cst) && kernel.has(cst.id)));
  ordered = ordered.concat(items.filter(cst => !ordered.includes(cst)));
  ordered = graph
    .sortStable(ordered.map(cst => cst.id))
    .map(id => itemById.get(id)!)
    .filter(Boolean);

  const result: ConstituentaBasicsDTO[] = [];
  const marked = new Set<number>();
  for (const cst of ordered) {
    if (marked.has(cst.id)) {
      continue;
    }
    result.push(cst);
    marked.add(cst.id);
    for (const childId of schema.cstByID.get(cst.id)?.spawn ?? []) {
      const child = ordered.find(item => item.id === childId);
      if (child && !marked.has(child.id)) {
        marked.add(child.id);
        result.push(child);
      }
    }
  }

  next.schema.items = result;
  bumpBundle(next);
  return next;
}

function resetAliases(bundle: SandboxBundle): SandboxBundle {
  const next = cloneBundle(bundle);
  const counts: Record<string, number> = {};
  const mapping: Record<string, string> = {};
  for (const value of Object.values(CstType)) {
    counts[value] = 1;
  }

  for (const cst of next.schema.items) {
    const alias = `${getCstTypePrefix(cst.cst_type)}${counts[cst.cst_type]}`;
    counts[cst.cst_type] += 1;
    if (cst.alias !== alias) {
      mapping[cst.alias] = alias;
    }
  }

  applyMappingToConstituents(next.schema.items, mapping, true);
  resolveAllConstituentTexts(next.schema.items);
  bumpBundle(next);
  return next;
}

function substituteConstituents(bundle: SandboxBundle, substitutions: Substitution[]): SandboxBundle {
  const next = cloneBundle(bundle);
  if (substitutions.length === 0) {
    return next;
  }

  const byId = new Map(next.schema.items.map(cst => [cst.id, cst]));
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

  const updatedAttributions = [];
  const seen = new Set<string>();
  for (const attr of next.schema.attribution) {
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
  next.schema.attribution = updatedAttributions;

  next.schema.items = next.schema.items.filter(cst => !deleted.has(cst.id));
  next.model.items = next.model.items.filter(value => !deleted.has(value.id));

  applyMappingToConstituents(next.schema.items, mapping, false);
  resolveAllConstituentTexts(next.schema.items);
  bumpBundle(next);
  return next;
}

function inlineSynthesis(bundle: SandboxBundle, data: InlineSynthesisDTO, source: RSFormDTO): SandboxBundle {
  if (data.source === null) {
    return bundle;
  }

  const sourceItems =
    data.items.length > 0 ? source.items.filter(cst => data.items.includes(cst.id)) : [...source.items];
  if (sourceItems.length === 0) {
    return bundle;
  }

  const next = cloneBundle(bundle);
  const receiverWasEmpty = next.schema.items.length === 0;
  const mappingAlias: Record<string, string> = {};

  if (!receiverWasEmpty) {
    const counts: Record<string, number> = {};
    for (const value of Object.values(CstType)) {
      counts[value] = maxAliasIndex(next.schema.items, value);
    }
    for (const cst of sourceItems) {
      counts[cst.cst_type] += 1;
      mappingAlias[cst.alias] = `${getCstTypePrefix(cst.cst_type)}${counts[cst.cst_type]}`;
    }
  }

  const mappingId: Record<number, number> = {};
  const inserted: ConstituentaBasicsDTO[] = [];
  const sourceIdSet = new Set(sourceItems.map(cst => cst.id));

  for (const cst of sourceItems) {
    const newId = next.meta.nextId;
    next.meta.nextId += 1;
    mappingId[cst.id] = newId;

    const cloned = structuredClone(cst);
    cloned.id = newId;
    if (!receiverWasEmpty) {
      cloned.alias = mappingAlias[cst.alias];
      applyMappingToConstituents([cloned], mappingAlias, false);
    }
    inserted.push(cloned);
  }

  const seenAttribution = new Set(next.schema.attribution.map(attr => `${attr.container}:${attr.attribute}`));
  for (const attr of source.attribution) {
    if (!sourceIdSet.has(attr.container) || !sourceIdSet.has(attr.attribute)) {
      continue;
    }
    const containerID = mappingId[attr.container];
    const attributeID = mappingId[attr.attribute];
    if (containerID === attributeID) {
      continue;
    }
    const key = `${containerID}:${attributeID}`;
    if (seenAttribution.has(key)) {
      continue;
    }
    seenAttribution.add(key);
    next.schema.attribution.push({ container: containerID, attribute: attributeID });
  }

  next.schema.items = next.schema.items.concat(inserted);
  resolveAllConstituentTexts(next.schema.items);

  if (data.substitutions.length === 0) {
    bumpBundle(next);
    return next;
  }

  const remapped: Substitution[] = [];
  for (const sub of data.substitutions) {
    if (sourceIdSet.has(sub.original)) {
      remapped.push({ original: mappingId[sub.original], substitution: sub.substitution });
    } else {
      remapped.push({ original: sub.original, substitution: mappingId[sub.substitution] });
    }
  }

  return substituteConstituents(next, remapped);
}

function createConstituenta(
  bundle: SandboxBundle,
  data: CreateConstituentaDTO
): { bundle: SandboxBundle; newCst: ConstituentaBasicsDTO } {
  const next = cloneBundle(bundle);
  const rsform = next.schema;

  const newId = next.meta.nextId;
  next.meta.nextId += 1;

  const newCst: ConstituentaBasicsDTO = {
    id: newId,
    alias: data.alias,
    convention: data.convention,
    crucial: data.crucial,
    cst_type: data.cst_type,
    definition_formal: data.definition_formal,
    typification_manual: data.typification_manual,
    value_is_property: data.value_is_property ?? false,
    definition_raw: data.definition_raw,
    definition_resolved: '',
    term_raw: data.term_raw,
    term_resolved: '',
    term_forms: data.term_forms
  };

  if (data.insert_after === null || data.insert_after === undefined) {
    rsform.items.push(newCst);
  } else {
    const idx = rsform.items.findIndex(i => i.id === data.insert_after);
    const insertAt = idx === -1 ? rsform.items.length : idx + 1;
    rsform.items.splice(insertAt, 0, newCst);
  }

  resolveConstituentTextChange(rsform.items, newId, {
    termChanged: true,
    termRawChanged: true,
    definitionRawChanged: true,
    clearTargetForms: false
  });
  bumpBundle(next);
  return { bundle: next, newCst };
}

function deleteConstituents(bundle: SandboxBundle, deleted: number[]): SandboxBundle {
  const next = cloneBundle(bundle);
  const del = new Set(deleted);
  const rsform = next.schema;
  const model = next.model;

  rsform.items = rsform.items.filter(i => !del.has(i.id));
  rsform.attribution = rsform.attribution.filter(a => !del.has(a.container) && !del.has(a.attribute));
  rsform.inheritance = rsform.inheritance.filter(row => !del.has(row.child) && !del.has(row.parent));

  model.items = model.items.filter(v => !del.has(v.id));

  bumpBundle(next);
  return next;
}

function updateConstituenta(bundle: SandboxBundle, data: UpdateConstituentaDTO): SandboxBundle {
  const next = cloneBundle(bundle);
  const rsform = next.schema;
  const index = rsform.items.findIndex(i => i.id === data.target);
  if (index === -1) {
    throw new Error(`updateConstituenta: unknown target ${data.target}`);
  }
  const row = rsform.items[index];
  const patch = data.item_data;
  const termRawChanged = typeof patch.term_raw === 'string' && patch.term_raw !== row.term_raw;
  const termFormsChanged = 'term_forms' in patch;
  const updated = {
    ...row,
    ...(patch.alias !== undefined ? { alias: patch.alias } : {}),
    ...(patch.cst_type !== undefined ? { cst_type: patch.cst_type } : {}),
    ...(patch.crucial !== undefined ? { crucial: patch.crucial } : {}),
    ...(patch.convention !== undefined ? { convention: patch.convention } : {}),
    ...(patch.definition_formal !== undefined ? { definition_formal: patch.definition_formal } : {}),
    ...(patch.typification_manual !== undefined ? { typification_manual: patch.typification_manual } : {}),
    ...(patch.value_is_property !== undefined ? { value_is_property: patch.value_is_property } : {}),
    ...(patch.definition_raw !== undefined ? { definition_raw: patch.definition_raw } : {}),
    ...(patch.term_raw !== undefined ? { term_raw: patch.term_raw } : {}),
    ...(patch.term_forms !== undefined ? { term_forms: patch.term_forms } : {})
  };

  rsform.items[index] = updated;
  resolveConstituentTextChange(rsform.items, data.target, {
    termChanged: termRawChanged || termFormsChanged,
    termRawChanged,
    definitionRawChanged: typeof patch.definition_raw === 'string',
    clearTargetForms: termRawChanged && !termFormsChanged
  });
  bumpBundle(next);
  return next;
}

function updateCrucial(bundle: SandboxBundle, data: UpdateCrucialDTO): SandboxBundle {
  const next = cloneBundle(bundle);
  const targets = new Set(data.target);
  next.schema.items = next.schema.items.map(row => (targets.has(row.id) ? { ...row, crucial: data.value } : row));
  bumpBundle(next);
  return next;
}

function createAttribution(bundle: SandboxBundle, attr: Attribution): SandboxBundle {
  const next = cloneBundle(bundle);
  const exists = next.schema.attribution.some(a => a.container === attr.container && a.attribute === attr.attribute);
  if (!exists) {
    next.schema.attribution.push({ ...attr });
  }
  bumpBundle(next);
  return next;
}

function deleteAttribution(bundle: SandboxBundle, attr: Attribution): SandboxBundle {
  const next = cloneBundle(bundle);
  next.schema.attribution = next.schema.attribution.filter(
    a => !(a.container === attr.container && a.attribute === attr.attribute)
  );
  bumpBundle(next);
  return next;
}

function clearAttributions(bundle: SandboxBundle, data: AttributionTargetDTO): SandboxBundle {
  const next = cloneBundle(bundle);
  const targetID = data.target;
  next.schema.attribution = next.schema.attribution.filter(a => a.container !== targetID && a.attribute !== targetID);
  bumpBundle(next);
  return next;
}

function updateLibraryItem(bundle: SandboxBundle, data: UpdateLibraryItemDTO): SandboxBundle {
  const next = cloneBundle(bundle);
  const timestamp = nowIso();
  if (data.id === next.schema.id && data.item_type === LibraryItemType.RSFORM) {
    Object.assign(next.schema, {
      title: data.title,
      alias: data.alias,
      description: data.description,
      visible: data.visible,
      read_only: data.read_only,
      time_update: timestamp
    });
  } else if (data.id === next.model.id && data.item_type === LibraryItemType.RSMODEL) {
    Object.assign(next.model, {
      title: data.title,
      alias: data.alias,
      description: data.description,
      visible: data.visible,
      read_only: data.read_only,
      time_update: timestamp
    });
    const modelEntry = next.schema.models.find(m => m.id === next.model.id);
    if (modelEntry) {
      modelEntry.alias = data.alias;
    }
  } else {
    throw new Error('updateLibraryItem: id does not match sandbox rsform or model');
  }
  next.meta.updatedAt = timestamp;
  return next;
}

function setModelItems(bundle: SandboxBundle, items: RSModelDTO['items']): SandboxBundle {
  const next = cloneBundle(bundle);
  next.model.items = structuredClone(items);
  bumpBundle(next);
  return next;
}

/** Merge value writes into {@link RSModelDTO.items} (payload matches API set-value). */
function applySetCstValue(bundle: SandboxBundle, updates: ConstituentaDataDTO): SandboxBundle {
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

function clearModelValues(bundle: SandboxBundle, cstIDs: number[]): SandboxBundle {
  const next = cloneBundle(bundle);
  const drop = new Set(cstIDs);
  next.model.items = next.model.items.filter(v => !drop.has(v.id));
  bumpBundle(next);
  return next;
}

function maxAliasIndex(items: ConstituentaBasicsDTO[], type: CstType): number {
  const prefix = getCstTypePrefix(type);
  return items.reduce((max, cst) => {
    if (cst.cst_type !== type) {
      return max;
    }
    const suffix = cst.alias.slice(prefix.length);
    const index = Number(suffix);
    return Number.isFinite(index) ? Math.max(max, index) : max;
  }, 0);
}
