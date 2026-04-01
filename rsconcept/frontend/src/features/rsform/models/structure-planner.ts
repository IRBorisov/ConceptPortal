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

export class StructurePlanner {
  private items: SPNode[] = [];
  private schema: RSForm;
  private target: Constituenta;
  private rootType: Typification;

  constructor(schema: RSForm, target: Constituenta) {
    if (!isTypification(target.analysis.type)) {
      throw new Error('Invalid typification for target');
    }
    this.schema = schema;
    this.target = target;
    this.rootType = target.analysis.type as Typification;
  }

  public build(): SPNode[] {
    this.items.push({
      key: 'root',
      path: makeTypePath([]),
      type: this.rootType,
      parent: null,
      definition: this.target.definition_formal,
      existing: this.target
    });
    this.visit(this.rootType, [], 0);
    return this.items;
  }

  private visit(type: Typification, path: number[], parent: number) {
    switch (type.typeID) {
      case TypeID.collection:
        if (type.base.typeID === TypeID.tuple) {
          type.base.factors.forEach((factor, index) => {
            const nextPath = [...path, index + 1];
            const nextType = bool(factor);
            const nextNode = this.pushNode(nextPath, nextType, parent);
            this.visit(nextType, nextPath, nextNode);
          });
        } else if (type.base.typeID === TypeID.collection) {
          const nextPath = [...path, 0];
          const nextNode = this.pushNode(nextPath, type.base, parent);
          this.visit(type.base, nextPath, nextNode);
        }
        return;
      case TypeID.tuple:
        type.factors.forEach((factor, index) => {
          const nextPath = [...path, index + 1];
          const nextNode = this.pushNode(nextPath, factor, parent);
          this.visit(factor, nextPath, nextNode);
        });
        return;
      default:
        return;
    }
  }

  private pushNode(path: number[], type: Typification, parent: number) {
    const typePath = makeTypePath(path);
    this.items.push({
      key: formatPathText(typePath),
      path: typePath,
      type,
      parent,
      definition: produceDefinition(this.target.alias, this.rootType, typePath),
      existing: findCstByStructure(this.schema, this.target, typePath)
    });
    return this.items.length - 1;
  }
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
        if (current.base.typeID === TypeID.tuple) {
          expression = `Pr${step}(${expression})`;
          current = bool(current.base.factors[step - 1]);
          index += 1;
        } else {
          expression = `red(${expression})`;
          current = current.base;
          index += 1;
        }
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

function formatPathText(path: TypePath): string {
  return path.map(step => String(step)).join('.');
}