/**
 * Attribution remapping helpers for substitution and schema embedding.
 */

import { type Attribution } from '../rsform';

function attributionKey(attr: Attribution): string {
  return `${attr.container}:${attr.attribute}`;
}

/**
 * Remap attributions when constituents are substituted (original → replacement).
 * Drops self-loops and duplicates. Matches sandbox / backend substitute attribution rewrite.
 */
export function remapAttributionsUnderSubstitution(
  attributions: readonly Attribution[],
  origToSub: ReadonlyMap<number, number>
): Attribution[] {
  const result: Attribution[] = [];
  const seen = new Set<string>();

  for (const attr of attributions) {
    if (!origToSub.has(attr.container) && !origToSub.has(attr.attribute)) {
      const key = attributionKey(attr);
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ ...attr });
      }
      continue;
    }

    const container = origToSub.get(attr.container) ?? attr.container;
    const attribute = origToSub.get(attr.attribute) ?? attr.attribute;
    if (container === attribute) {
      continue;
    }
    const key = `${container}:${attribute}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({ container, attribute });
  }

  return result;
}

/**
 * Copy attributions whose both endpoints are in {@link sourceIdSet}, remapping ids via {@link idMap}.
 * Appends onto a clone of {@link existing} with dedupe. Used by schema embedding / insert.
 */
export function importAttributions(
  sourceAttributions: readonly Attribution[],
  sourceIdSet: ReadonlySet<number>,
  idMap: Readonly<Record<number, number>>,
  existing: readonly Attribution[] = []
): Attribution[] {
  const result = existing.map(attr => ({ ...attr }));
  const seen = new Set(result.map(attributionKey));

  for (const attr of sourceAttributions) {
    if (!sourceIdSet.has(attr.container) || !sourceIdSet.has(attr.attribute)) {
      continue;
    }
    const container = idMap[attr.container];
    const attribute = idMap[attr.attribute];
    if (container === undefined || attribute === undefined || container === attribute) {
      continue;
    }
    const key = `${container}:${attribute}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({ container, attribute });
  }

  return result;
}

/** Drop attributions that reference any id in {@link deletedIds}. */
export function filterAttributions(
  attributions: readonly Attribution[],
  deletedIds: ReadonlySet<number>
): Attribution[] {
  return attributions.filter(attr => !deletedIds.has(attr.container) && !deletedIds.has(attr.attribute));
}
