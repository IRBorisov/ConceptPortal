/**
 * Module: API for OperationSystem.
 */

import { describeSubstitutionError, information } from '@/utils/labels';
import { TextMatcher } from '@/utils/utils';

import { Graph } from './Graph';
import { ILibraryItem, LibraryItemID } from './library';
import { ICstSubstitute, IOperation, IOperationSchema, SubstitutionErrorType } from './oss';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from './rsform';
import { AliasMapping, ParsingStatus } from './rslang';
import { applyAliasMapping, applyTypificationMapping, extractGlobals, isSetTypification } from './rslangAPI';

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

type CrossMapping = Map<LibraryItemID, AliasMapping>;

/**
 * Validator for Substitution table.
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
    if (!this.checkTypifications()) {
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
      if (original.parse.status === ParsingStatus.INCORRECT || substitution.parse.status === ParsingStatus.INCORRECT) {
        return this.reportError(SubstitutionErrorType.incorrectCst, [substitution.alias, original.alias]);
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

  private checkTypifications(): boolean {
    const baseMappings = this.prepareBaseMappings();
    const typeMappings = this.calculateSubstituteMappings(baseMappings);
    if (typeMappings === null) {
      return false;
    }
    for (const item of this.substitutions) {
      const original = this.cstByID.get(item.original)!;
      if (original.cst_type === CstType.BASE || original.cst_type === CstType.CONSTANT) {
        continue;
      }
      const substitution = this.cstByID.get(item.substitution)!;
      const originalType = applyTypificationMapping(
        applyAliasMapping(original.parse.typification, baseMappings.get(original.schema)!),
        typeMappings
      );
      const substitutionType = applyTypificationMapping(
        applyAliasMapping(substitution.parse.typification, baseMappings.get(substitution.schema)!),
        typeMappings
      );
      if (originalType !== substitutionType) {
        return this.reportError(SubstitutionErrorType.unequalTypification, [substitution.alias, original.alias]);
      }
      if (original.parse.args.length === 0) {
        continue;
      }
      if (substitution.parse.args.length !== original.parse.args.length) {
        return this.reportError(SubstitutionErrorType.unequalArgsCount, [substitution.alias, original.alias]);
      }
      for (let i = 0; i < original.parse.args.length; ++i) {
        const originalArg = applyTypificationMapping(
          applyAliasMapping(original.parse.args[i].typification, baseMappings.get(original.schema)!),
          typeMappings
        );
        const substitutionArg = applyTypificationMapping(
          applyAliasMapping(substitution.parse.args[i].typification, baseMappings.get(substitution.schema)!),
          typeMappings
        );
        if (originalArg !== substitutionArg) {
          return this.reportError(SubstitutionErrorType.unequalArgs, [substitution.alias, original.alias]);
        }
      }
    }
    return true;
  }

  private prepareBaseMappings(): CrossMapping {
    const result: CrossMapping = new Map();
    let baseCount = 0;
    let constCount = 0;
    for (const schema of this.schemas) {
      const mapping: AliasMapping = {};
      for (const cst of schema.items) {
        if (cst.cst_type === CstType.BASE) {
          baseCount++;
          mapping[cst.alias] = `X${baseCount}`;
        } else if (cst.cst_type === CstType.CONSTANT) {
          constCount++;
          mapping[cst.alias] = `C${constCount}`;
        }
        result.set(schema.id, mapping);
      }
    }
    return result;
  }

  private calculateSubstituteMappings(baseMappings: CrossMapping): AliasMapping | null {
    const result: AliasMapping = {};
    const processed = new Set<string>();
    for (const item of this.substitutions) {
      const original = this.cstByID.get(item.original)!;
      if (original.cst_type !== CstType.BASE && original.cst_type !== CstType.CONSTANT) {
        continue;
      }
      const originalAlias = baseMappings.get(original.schema)![original.alias];

      const substitution = this.cstByID.get(item.substitution)!;
      let substitutionText = '';
      if (substitution.cst_type === original.cst_type) {
        substitutionText = baseMappings.get(substitution.schema)![substitution.alias];
      } else {
        substitutionText = applyAliasMapping(substitution.parse.typification, baseMappings.get(substitution.schema)!);
        substitutionText = applyTypificationMapping(substitutionText, result);
        console.log(substitutionText);
        if (!isSetTypification(substitutionText)) {
          this.reportError(SubstitutionErrorType.baseSubstitutionNotSet, [
            substitution.alias,
            substitution.parse.typification
          ]);
          return null;
        }
        if (substitutionText.includes('×') || substitutionText.startsWith('ℬℬ')) {
          substitutionText = substitutionText.slice(1);
        } else {
          substitutionText = substitutionText.slice(2, -1);
        }
      }
      for (const prevAlias of processed) {
        result[prevAlias] = applyTypificationMapping(result[prevAlias], { [originalAlias]: substitutionText });
      }
      result[originalAlias] = substitutionText;
      processed.add(originalAlias);
    }
    return result;
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
