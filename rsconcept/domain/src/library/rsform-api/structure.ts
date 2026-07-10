/**
 * Structure-path helpers for spawned constituents.
 */

import { TypeID, type TypePath, type Typification } from '../../rslang';
import { isTypification } from '../../rslang/semantic/typification';
import { applyPath } from '../../rslang/semantic/typification-api';
import { type Constituenta, type RSForm } from '../rsform';

/**
 * Id to pass as `insert_after` when creating a new {@link Constituenta} spawned by `targetId`:
 * after the last existing child of that spawner, or after the spawner itself if none.
 */
export function inferNewSpawnPosition(schema: RSForm, targetId: number): number {
  let last: number | null = null;
  for (const cst of schema.items) {
    if (cst.spawner === targetId) {
      last = cst.id;
    }
  }
  return last ?? targetId;
}

/** Finds {@link Constituenta} by structure path. */
export function findCstByStructure(schema: RSForm, target: Constituenta, path: TypePath): Constituenta | null {
  const byId = schema.cstByID ?? new Map(schema.items.map(item => [item.id, item]));
  for (const cst of schema.items) {
    if (!cst.spawner_path) {
      continue;
    }
    const absolutePath = resolveAbsoluteSpawnerPath(cst, target.id, byId);
    if (absolutePath?.length === path.length && absolutePath.every((v, i) => v === path[i])) {
      return cst;
    }
  }
  return null;
}

/** Retrieves name for piece of target {@link Constituenta} structure. */
export function getStructureName(schema: RSForm, target: Constituenta, path: TypePath): string {
  const representation = findCstByStructure(schema, target, path);
  if (representation) {
    return `${representation.alias}: ${representation.term_resolved}`;
  }
  if (!isTypification(target.effectiveType)) {
    return '';
  }
  const type = applyPath(target.effectiveType as Typification, path);
  if (type?.typeID === TypeID.basic) {
    const cst = schema.cstByAlias.get(type.baseID);
    if (cst?.term_resolved) {
      return `${cst.alias}: ${cst.term_resolved}`;
    }
  }
  return '';
}

function resolveAbsoluteSpawnerPath(
  cst: Constituenta,
  targetId: number,
  byId: Map<number, Constituenta>
): TypePath | null {
  if (!cst.spawner_path || cst.spawner == null) {
    return null;
  }
  if (cst.spawner === targetId) {
    return cst.spawner_path;
  }

  const visited = new Set<number>([cst.id]);
  let currentPath: number[] = [...cst.spawner_path];
  let currentSpawnerId: number | null = cst.spawner;

  while (currentSpawnerId != null) {
    if (currentSpawnerId === targetId) {
      return currentPath as TypePath;
    }
    if (visited.has(currentSpawnerId)) {
      return null;
    }
    visited.add(currentSpawnerId);

    const parent = byId.get(currentSpawnerId);
    if (!parent?.spawner_path || parent.spawner == null) {
      return null;
    }

    currentPath = [...parent.spawner_path, ...currentPath];
    currentSpawnerId = parent.spawner;
  }

  return null;
}
