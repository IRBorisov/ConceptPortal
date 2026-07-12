/**
 * Schema embedding (synthesis): insert constituents from a source schema into a receiver,
 * then apply an identification (substitution) table.
 *
 * Mirrors backend `inline_synthesis` / `insert_from` + `substitute`
 * (Portal UI: «Встраивание схемы»).
 */

import { type AliasMapping } from '../../rslang/api';
import { type LibraryItem } from '../library';
import { type Attribution, type CstType, type RSForm, type Substitution } from '../rsform';

import { allocateImportAliases, applyMappingToConstituents, type MappableFields } from './alias';
import { importAttributions } from './attribution';
import { applyConstituentSubstitutions, remapSubstitutionsAfterImport } from './substitution';
import { resolveAllConstituentTexts } from './text-resolution';
import { type AliasTypedFields, type TextResolvableFields } from './types';

/** Field intersection required for embedding / synthesis transforms. */
export type SynthesizableFields = MappableFields &
  TextResolvableFields &
  AliasTypedFields & {
    id: number;
    alias: string;
    cst_type: CstType;
  };

/** Input for {@link inlineSynthesis}. */
export interface InlineSynthesisInput<T extends SynthesizableFields> {
  /** Receiver schema constituents (order preserved; imports append). */
  receiverItems: readonly T[];
  /** Receiver attributions (default empty). */
  receiverAttributions?: readonly Attribution[];
  /**
   * Source constituents to insert (already filtered to the desired subset).
   * Cloned; originals are not mutated.
   */
  sourceItems: readonly T[];
  /** Source attributions whose both endpoints are among {@link sourceItems}. */
  sourceAttributions?: readonly Attribution[];
  /**
   * Identification table using pre-import ids:
   * one endpoint is a source id, the other a receiver id
   * (same rules as backend embedding / InlineSynthesis).
   */
  substitutions?: readonly Substitution[];
  /** Next free numeric id for inserted constituents. */
  nextId: number;
}

/** Result of {@link inlineSynthesis}. */
export interface InlineSynthesisResult<T extends SynthesizableFields> {
  items: T[];
  attributions: Attribution[];
  /** Updated next-id after inserts. */
  nextId: number;
  /** Source id → inserted id. */
  idMap: Record<number, number>;
  /** Alias remapping applied to imported constituents (empty when receiver was empty). */
  aliasMapping: AliasMapping;
  /** Ids removed by substitutions. */
  deletedIds: Set<number>;
  /** Ids of newly inserted constituents (before any were deleted by substitutions). */
  insertedIds: number[];
  /** Survivor ids referenced by applied substitutions. */
  replacementIds: number[];
}

/**
 * Embed {@link InlineSynthesisInput.sourceItems} into the receiver and apply substitutions.
 * Resolves term/definition entity references on the result.
 * Does not mutate inputs.
 */
export function inlineSynthesis<T extends SynthesizableFields>(
  input: InlineSynthesisInput<T>
): InlineSynthesisResult<T> {
  const sourceItems = input.sourceItems;
  if (sourceItems.length === 0) {
    return {
      items: input.receiverItems.map(item => structuredClone(item)),
      attributions: (input.receiverAttributions ?? []).map(attr => ({ ...attr })),
      nextId: input.nextId,
      idMap: {},
      aliasMapping: {},
      deletedIds: new Set(),
      insertedIds: [],
      replacementIds: []
    };
  }

  const receiverItems = input.receiverItems.map(item => structuredClone(item));
  let attributions = (input.receiverAttributions ?? []).map(attr => ({ ...attr }));
  const aliasMapping = allocateImportAliases(receiverItems, sourceItems);
  const idMap: Record<number, number> = {};
  const inserted: T[] = [];
  const sourceIdSet = new Set(sourceItems.map(cst => cst.id));
  let nextId = input.nextId;

  for (const cst of sourceItems) {
    const newId = nextId;
    nextId += 1;
    idMap[cst.id] = newId;

    const cloned = structuredClone(cst);
    cloned.id = newId;
    if (Object.keys(aliasMapping).length > 0) {
      cloned.alias = aliasMapping[cst.alias];
      applyMappingToConstituents([cloned], aliasMapping, false);
    }
    inserted.push(cloned);
  }

  attributions = importAttributions(input.sourceAttributions ?? [], sourceIdSet, idMap, attributions);
  const items = receiverItems.concat(inserted);
  resolveAllConstituentTexts(items);

  const substitutions = input.substitutions ?? [];
  if (substitutions.length === 0) {
    return {
      items,
      attributions,
      nextId,
      idMap,
      aliasMapping,
      deletedIds: new Set(),
      insertedIds: inserted.map(cst => cst.id),
      replacementIds: []
    };
  }

  const remapped = remapSubstitutionsAfterImport(substitutions, sourceIdSet, idMap);
  const substituted = applyConstituentSubstitutions(items, attributions, remapped);
  resolveAllConstituentTexts(substituted.items);

  return {
    items: substituted.items,
    attributions: substituted.attributions,
    nextId,
    idMap,
    aliasMapping,
    deletedIds: substituted.deletedIds,
    insertedIds: inserted.map(cst => cst.id),
    replacementIds: substituted.replacementIds
  };
}

/** Sorts library items relevant for schema embedding with specified {@link RSForm}. */
export function sortItemsForInlineSynthesis(receiver: RSForm, items: readonly LibraryItem[]): LibraryItem[] {
  const result = items.filter(item => item.location === receiver.location);
  const included = new Set(result);
  for (const item of items) {
    if (item.visible && item.owner === receiver.owner && !included.has(item)) {
      result.push(item);
      included.add(item);
    }
  }
  for (const item of items) {
    if (item.visible && !included.has(item)) {
      result.push(item);
      included.add(item);
    }
  }
  for (const item of items) {
    if (!included.has(item)) {
      result.push(item);
      included.add(item);
    }
  }
  return result;
}
