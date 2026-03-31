import { makeTypePath, type TypePath } from '@/features/rslang';
import { bool, isTypification, TypeID, type Typification } from '@/features/rslang/semantic/typification';

import { type Constituenta, type RSForm } from './rsform';
import { findCstByStructure } from './rsform-api';

export interface SPNode {
  key: string;
  path: TypePath;
  type: Typification;
  parent: number | null;
  definition: string;
  existing: Constituenta | null;
}

export function buildStructurePlanner(schema: RSForm, target: Constituenta): SPNode[] {
  if (!isTypification(target.analysis.type)) {
    return [];
  }

  const rootType = target.analysis.type as Typification;
  const items: SPNode[] = [
    {
      key: formatPathText(makeTypePath([])),
      path: makeTypePath([]),
      type: rootType,
      parent: null,
      definition: target.definition_formal,
      existing: target
    }
  ];

  function visit(type: Typification, path: number[], parent: number) {
    switch (type.typeID) {
      case TypeID.collection:
        if (type.base.typeID === TypeID.tuple) {
          type.base.factors.forEach((factor, index) => {
            const nextPath = [...path, 0, index + 1];
            const nextType = bool(factor);
            const nextNode = pushNode(nextPath, nextType, parent);
            visit(nextType, nextPath, nextNode);
          });
        } else {
          const nextPath = [...path, 0];
          const nextNode = pushNode(nextPath, type.base, parent);
          visit(type.base, nextPath, nextNode);
        }
        return;
      case TypeID.tuple:
        type.factors.forEach((factor, index) => {
          const nextPath = [...path, index + 1];
          const nextNode = pushNode(nextPath, factor, parent);
          visit(factor, nextPath, nextNode);
        });
        return;
      default:
        return;
    }
  }

  function pushNode(path: number[], type: Typification, parent: number) {
    const typePath = makeTypePath(path);
    items.push({
      key: formatPathText(typePath),
      path: typePath,
      type,
      parent,
      definition: produceDefinition(target.alias, rootType, typePath),
      existing: findCstByStructure(schema, target, typePath)
    });
    return items.length - 1;
  }

  visit(rootType, [], 0);
  return items;
}

export function formatPathText(path: TypePath): string {
  if (path.length === 0) {
    return 'root';
  }
  return path.map(step => String(step)).join('.');
}

export function getStructureEdgeMeta(parent: TypePath, child: TypePath) {
  const suffix = child.slice(parent.length);
  if (suffix.length === 1 && suffix[0] === 0) {
    return { type: 'boolean' as const };
  }
  if (suffix.length === 1 && suffix[0] > 0) {
    return { type: 'cartesian' as const, projection: suffix[0] };
  }
  if (suffix.length === 2 && suffix[0] === 0 && suffix[1] > 0) {
    return { type: 'cartesian' as const, projection: suffix[1] };
  }
  return { type: 'boolean' as const };
}

// ======= Internals =======
function produceDefinition(alias: string, rootType: Typification, path: TypePath): string {
  let current = rootType;
  let expression = alias;
  let index = 0;

  while (index < path.length) {
    const step = path[index];
    switch (current.typeID) {
      case TypeID.collection:
        if (step !== 0) {
          return expression;
        }
        if (current.base.typeID === TypeID.tuple && index + 1 < path.length) {
          const projection = path[index + 1];
          expression = `Pr${projection}(${expression})`;
          current = bool(current.base.factors[projection - 1]);
          index += 2;
          break;
        }
        expression = `red(${expression})`;
        current = current.base;
        index += 1;
        break;
      case TypeID.tuple:
        expression = `pr${step}(${expression})`;
        current = current.factors[step - 1];
        index += 1;
        break;
      default:
        return expression;
    }
  }

  return expression;
}
