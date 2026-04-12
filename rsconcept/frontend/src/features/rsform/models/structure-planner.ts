import { makeTypePath, type TypePath } from '@/domain/rslang';
import { splitTemplateDefinition } from '@/domain/rslang/api';
import { labelType } from '@/domain/rslang/labels';
import {
  bool,
  type EchelonFunctional,
  isTypification,
  TypeID,
  type Typification
} from '@/domain/rslang/semantic/typification';

import { type Constituenta, CstType, type RSForm } from './rsform';
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
    if (!isTypification(target.analysis.type) && target.cst_type !== CstType.FUNCTION) {
      throw new Error('Invalid typification for target');
    }
    this.schema = schema;
    this.target = target;
    if (target.cst_type === CstType.FUNCTION) {
      this.rootType = (target.analysis.type as EchelonFunctional).result;
    } else {
      this.rootType = target.analysis.type as Typification;
    }
  }

  public build(): SPNode[] {
    this.items.push({
      key: 'root',
      path: makeTypePath([]),
      type: this.rootType,
      parent: null,
      definition: labelType(this.target.analysis.type),
      existing: this.target
    });
    this.visit(this.rootType, this.rootType.typeID === TypeID.collection ? [0] : [], 0);
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
      type: type,
      parent: parent,
      definition: produceDefinition(this.target, this.rootType, typePath),
      existing: findCstByStructure(this.schema, this.target, typePath)
    });
    return this.items.length - 1;
  }
}

// ======= Internals =======
function produceDefinition(target: Constituenta, rootType: Typification, path: TypePath): string {
  let current = rootType;
  let expression = target.alias;
  let index = rootType.typeID === TypeID.collection ? 1 : 0;
  let prefix = '';
  if (target.cst_type === CstType.FUNCTION) {
    prefix = `[${splitTemplateDefinition(target.definition_formal).head}] `;
    const args = (target.analysis.type as EchelonFunctional).args;
    expression = `${expression}[${args.map(arg => arg.alias).join(', ')}]`;
  }

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
        return prefix + expression;
    }
  }

  return prefix + expression;
}

function formatPathText(path: TypePath): string {
  return path.map(step => String(step)).join('.');
}
