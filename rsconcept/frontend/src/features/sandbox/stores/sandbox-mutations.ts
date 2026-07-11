import { LibraryItemType } from '@rsconcept/domain/library';
import { type Attribution, type RSForm, type Substitution } from '@rsconcept/domain/library/rsform';
import {
  applyConstituentSubstitutions,
  applyMappingToConstituents,
  buildSequentialAliasMapping,
  filterAttributions,
  inlineSynthesis as domainInlineSynthesis,
  insertItemAfter,
  moveIdsInOrder,
  reorderItemsByIds,
  resolveAllConstituentTexts,
  resolveConstituentTextChange,
  restoreConstituentOrder
} from '@rsconcept/domain/library/rsform-api';

import { type UpdateLibraryItemDTO } from '@/features/library';
import {
  type AttributionTargetDTO,
  type ConstituentaBasicsDTO,
  type CreateConstituentaDTO,
  type CreateConstituentsBatchDTO,
  type InlineSynthesisDTO,
  type MoveConstituentsDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from '@/features/rsform';
import { type ConstituentaDataDTO, type ConstituentaValue, type RSModelDTO } from '@/features/rsmodel';

import { nowIso } from '@/utils/format';

import { type SandboxBundle } from '../models/bundle';
import { bumpBundle, cloneBundle } from '../models/bundle-api';

/** Sandbox mutations API. */
export const sbApi = {
  moveConstituents,
  restoreOrder,
  resetAliases,
  substituteConstituents,
  inlineSynthesis,
  createConstituenta,
  createConstituentsBatch,
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
  const newOrder = moveIdsInOrder(
    next.schema.items.map(cst => cst.id),
    data.items,
    data.move_to
  );
  next.schema.items = reorderItemsByIds(next.schema.items, newOrder);
  bumpBundle(next);
  return next;
}

function restoreOrder(bundle: SandboxBundle, _schema: RSForm): SandboxBundle {
  const next = cloneBundle(bundle);
  const items = next.schema.items;
  if (items.length <= 1) {
    bumpBundle(next);
    return next;
  }

  const orderable = items.map(cst => ({
    id: cst.id,
    alias: cst.alias,
    cst_type: cst.cst_type,
    definition_formal: cst.definition_formal
  }));
  next.schema.items = reorderItemsByIds(
    items,
    restoreConstituentOrder(orderable).map(cst => cst.id)
  );
  bumpBundle(next);
  return next;
}

function resetAliases(bundle: SandboxBundle): SandboxBundle {
  const next = cloneBundle(bundle);
  const mapping = buildSequentialAliasMapping(next.schema.items);
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

  const result = applyConstituentSubstitutions(next.schema.items, next.schema.attribution, substitutions);
  next.schema.items = result.items;
  next.schema.attribution = result.attributions;
  next.model.items = next.model.items.filter(value => !result.deletedIds.has(value.id));
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
  const result = domainInlineSynthesis({
    receiverItems: next.schema.items,
    receiverAttributions: next.schema.attribution,
    sourceItems,
    sourceAttributions: source.attribution,
    substitutions: data.substitutions,
    nextId: next.meta.nextId
  });

  next.schema.items = result.items;
  next.schema.attribution = result.attributions;
  next.meta.nextId = result.nextId;
  next.model.items = next.model.items.filter(value => !result.deletedIds.has(value.id));
  bumpBundle(next);
  return next;
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

  insertItemAfter(rsform.items, newCst, data.insert_after);
  resolveConstituentTextChange(rsform.items, newId, {
    termChanged: true,
    termRawChanged: true,
    definitionRawChanged: true,
    clearTargetForms: false
  });
  bumpBundle(next);
  return { bundle: next, newCst };
}

function createConstituentsBatch(
  bundle: SandboxBundle,
  data: CreateConstituentsBatchDTO
): { bundle: SandboxBundle; newCstList: ConstituentaBasicsDTO[] } {
  let current = bundle;
  let insertAfter: number | null = data.insert_after;
  const newCstList: ConstituentaBasicsDTO[] = [];
  for (const item of data.items) {
    const result = createConstituenta(current, { ...item, insert_after: insertAfter });
    current = result.bundle;
    insertAfter = result.newCst.id;
    newCstList.push(result.newCst);
  }
  return { bundle: current, newCstList };
}

function deleteConstituents(bundle: SandboxBundle, deleted: number[]): SandboxBundle {
  const next = cloneBundle(bundle);
  const del = new Set(deleted);
  const rsform = next.schema;
  const model = next.model;

  rsform.items = rsform.items.filter(i => !del.has(i.id));
  rsform.attribution = filterAttributions(rsform.attribution, del);
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
