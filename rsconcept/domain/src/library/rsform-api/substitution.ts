/**
 * Constituenta substitution and post-import substitution remapping.
 */

import { type AliasMapping } from '../../rslang/api';
import { type Attribution, type Substitution } from '../rsform';

import { applyMappingToConstituents, type MappableFields } from './alias';
import { remapAttributionsUnderSubstitution } from './attribution';

/** Result of applying substitutions to a schema fragment. */
export interface SubstitutionResult<T> {
  items: T[];
  attributions: Attribution[];
  deletedIds: Set<number>;
  /** Replacement constituent ids (survivors referenced by substitutions). */
  replacementIds: number[];
}

/**
 * Apply constituenta substitutions: remap attributions, drop originals, rewrite aliases in survivors.
 * Does not resolve texts — call {@link resolveAllConstituentTexts} afterwards.
 */
export function applyConstituentSubstitutions<T extends MappableFields & { id: number; alias: string }>(
  items: readonly T[],
  attributions: readonly Attribution[],
  substitutions: readonly Substitution[]
): SubstitutionResult<T> {
  if (substitutions.length === 0) {
    return {
      items: [...items],
      attributions: attributions.map(attr => ({ ...attr })),
      deletedIds: new Set(),
      replacementIds: []
    };
  }

  const byId = new Map(items.map(cst => [cst.id, cst]));
  const mapping: AliasMapping = {};
  const deletedIds = new Set<number>();
  const origToSub = new Map<number, number>();
  const replacementIds: number[] = [];

  for (const { original, substitution } of substitutions) {
    const originalCst = byId.get(original);
    const substitutionCst = byId.get(substitution);
    if (!originalCst || !substitutionCst) {
      throw new Error(`applyConstituentSubstitutions: unknown constituenta ${original} -> ${substitution}`);
    }
    mapping[originalCst.alias] = substitutionCst.alias;
    deletedIds.add(original);
    origToSub.set(original, substitution);
    replacementIds.push(substitution);
  }

  const nextItems = items.filter(cst => !deletedIds.has(cst.id));
  applyMappingToConstituents(nextItems, mapping, false);

  return {
    items: nextItems,
    attributions: remapAttributionsUnderSubstitution(attributions, origToSub),
    deletedIds,
    replacementIds
  };
}

/**
 * Remap substitution endpoints after source constituents were inserted under new ids.
 * If {@link original} was imported, map it; otherwise map {@link substitution}.
 */
export function remapSubstitutionsAfterImport(
  substitutions: readonly Substitution[],
  sourceIdSet: ReadonlySet<number>,
  idMap: Readonly<Record<number, number>>
): Substitution[] {
  return substitutions.map(sub => {
    if (sourceIdSet.has(sub.original)) {
      return { original: idMap[sub.original], substitution: sub.substitution };
    }
    return { original: sub.original, substitution: idMap[sub.substitution] };
  });
}
