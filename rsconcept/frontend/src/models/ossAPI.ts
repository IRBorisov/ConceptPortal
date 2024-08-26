/**
 * Module: API for OperationSystem.
 */

import { describeSubstitutionError, information } from '@/utils/labels';
import { TextMatcher } from '@/utils/utils';

import { Graph } from './Graph';
import { ILibraryItem, LibraryItemID } from './library';
import { ICstSubstitute, IOperation, IOperationSchema, SubstitutionErrorType } from './oss';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from './rsform';
import { extractGlobals } from './rslangAPI';

/**
 * Checks if a given target {@link IOperation} matches the specified query using.
 *
 * @param target - The target object to be matched.
 * @param query - The query string used for matching.
 */
export function matchOperation(target: IOperation, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title);
}

/**
 * Sorts library items relevant for the specified {@link IOperationSchema}.
 *
 * @param oss - The {@link IOperationSchema} to be sorted.
 * @param items - The items to be sorted.
 */
export function sortItemsForOSS(oss: IOperationSchema, items: ILibraryItem[]): ILibraryItem[] {
  const result = items.filter(item => item.location === oss.location);
  for (const item of items) {
    if (item.visible && item.owner === oss.owner && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (item.visible && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Validator for Substitution table.
 *
 */
export class SubstitutionValidator {
  public msg: string = '';

  private schemas: IRSForm[];
  private substitutions: ICstSubstitute[];
  private cstByID = new Map<ConstituentaID, IConstituenta>();
  private schemaByID = new Map<LibraryItemID, IRSForm>();
  private schemaByCst = new Map<ConstituentaID, IRSForm>();

  constructor(schemas: IRSForm[], substitutions: ICstSubstitute[]) {
    this.schemas = schemas;
    this.substitutions = substitutions;
    schemas.forEach(schema => {
      this.schemaByID.set(schema.id, schema);
      schema.items.forEach(item => {
        this.cstByID.set(item.id, item);
        this.schemaByCst.set(item.id, schema);
      });
    });
  }

  public validate(): boolean {
    if (this.substitutions.length === 0) {
      return this.setValid();
    }
    if (!this.checkTypes()) {
      return false;
    }
    if (!this.checkCycles()) {
      return false;
    }

    return this.setValid();
  }

  private checkTypes(): boolean {
    for (const item of this.substitutions) {
      const original = this.cstByID.get(item.original);
      const substitution = this.cstByID.get(item.substitution);
      if (!original || !substitution) {
        return this.reportError(SubstitutionErrorType.invalidIDs, []);
      }
      switch (substitution.cst_type) {
        case CstType.BASE: {
          if (original.cst_type !== CstType.BASE && original.cst_type !== CstType.CONSTANT) {
            return this.reportError(SubstitutionErrorType.invalidBasic, [substitution.alias, original.alias]);
          }
          break;
        }

        case CstType.CONSTANT: {
          if (original.cst_type !== CstType.CONSTANT) {
            return this.reportError(SubstitutionErrorType.invalidConstant, [substitution.alias, original.alias]);
          }
          break;
        }

        case CstType.AXIOM:
        case CstType.THEOREM: {
          if (original.cst_type !== CstType.AXIOM && original.cst_type !== CstType.THEOREM) {
            return this.reportError(SubstitutionErrorType.invalidClasses, [substitution.alias, original.alias]);
          }
          break;
        }

        case CstType.FUNCTION: {
          if (original.cst_type !== CstType.FUNCTION) {
            return this.reportError(SubstitutionErrorType.invalidClasses, [substitution.alias, original.alias]);
          }
          break;
        }
        case CstType.PREDICATE: {
          if (original.cst_type !== CstType.PREDICATE) {
            return this.reportError(SubstitutionErrorType.invalidClasses, [substitution.alias, original.alias]);
          }
          break;
        }

        case CstType.TERM:
        case CstType.STRUCTURED: {
          if (
            original.cst_type !== CstType.TERM &&
            original.cst_type !== CstType.STRUCTURED &&
            original.cst_type !== CstType.BASE
          ) {
            return this.reportError(SubstitutionErrorType.invalidClasses, [substitution.alias, original.alias]);
          }
          break;
        }
      }
    }
    return true;
  }

  private checkCycles(): boolean {
    const graph = new Graph();
    for (const schema of this.schemas) {
      for (const cst of schema.items) {
        if (cst.cst_type === CstType.BASE || cst.cst_type === CstType.CONSTANT) {
          graph.addNode(cst.id);
        }
      }
    }
    for (const item of this.substitutions) {
      const original = this.cstByID.get(item.original)!;
      const substitution = this.cstByID.get(item.substitution)!;
      for (const cst of [original, substitution]) {
        if (cst.cst_type === CstType.BASE || cst.cst_type === CstType.CONSTANT) {
          continue;
        }
        graph.addNode(cst.id);
        const parents = extractGlobals(cst.parse.typification);
        for (const arg of cst.parse.args) {
          for (const alias of extractGlobals(arg.typification)) {
            parents.add(alias);
          }
        }
        if (parents.size === 0) {
          continue;
        }
        const schema = this.schemaByID.get(cst.schema)!;
        for (const alias of parents) {
          const parent = schema.cstByAlias.get(alias);
          if (parent) {
            graph.addEdge(parent.id, cst.id);
          }
        }
      }
      graph.addEdge(substitution.id, original.id);
    }
    const cycle = graph.findCycle();
    if (cycle !== null) {
      const cycleMsg = cycle
        .map(id => {
          const cst = this.cstByID.get(id)!;
          const schema = this.schemaByID.get(cst.schema)!;
          return `[${schema.alias}]-${cst.alias}`;
        })
        .join(', ');
      return this.reportError(SubstitutionErrorType.typificationCycle, [cycleMsg]);
    }
    return true;
  }

  private setValid(): boolean {
    this.msg = information.substitutionsCorrect;
    return true;
  }

  private reportError(errorType: SubstitutionErrorType, params: string[]): boolean {
    this.msg = describeSubstitutionError({
      errorType: errorType,
      params: params
    });
    return false;
  }
}
