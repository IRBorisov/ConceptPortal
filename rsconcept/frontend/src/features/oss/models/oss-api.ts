/**
 * Module: API for OperationSystem.
 */

import { type ILibraryItem } from '@/features/library';
import {
  type AliasMapping,
  CstClass,
  CstType,
  type IConstituenta,
  type ICstSubstitute,
  type IRSForm,
  ParsingStatus
} from '@/features/rsform';
import {
  applyAliasMapping,
  applyTypificationMapping,
  extractGlobals,
  isSetTypification
} from '@/features/rsform/models/rslang-api';

import { infoMsg } from '@/utils/labels';

import { Graph } from '../../../models/graph';
import { describeSubstitutionError } from '../labels';

import { type IOperationSchema, NodeType, SubstitutionErrorType } from './oss';

const STARTING_SUB_INDEX = 900; // max semantic index for starting substitution

export function constructNodeID(type: NodeType, itemID: number): string {
  return type === NodeType.OPERATION ? 'o' + String(itemID) : 'b' + String(itemID);
}

/** Sorts library items relevant for the specified {@link IOperationSchema}. */
export function sortItemsForOSS(oss: IOperationSchema, items: readonly ILibraryItem[]): ILibraryItem[] {
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

type CrossMapping = Map<number, AliasMapping>;

/** Validator for Substitution table. */
export class SubstitutionValidator {
  public msg: string = '';
  public suggestions: ICstSubstitute[] = [];

  private schemas: IRSForm[];
  private substitutions: ICstSubstitute[];
  private constituents = new Set<number>();
  private originals = new Set<number>();
  private mapping: CrossMapping = new Map();

  private cstByID = new Map<number, IConstituenta>();
  private schemaByID = new Map<number, IRSForm>();
  private schemaByCst = new Map<number, IRSForm>();

  constructor(schemas: IRSForm[], substitutions: ICstSubstitute[]) {
    this.schemas = schemas;
    this.substitutions = substitutions;
    if (schemas.length === 0 || substitutions.length === 0) {
      return;
    }

    schemas.forEach(schema => {
      this.schemaByID.set(schema.id, schema);
      this.mapping.set(schema.id, {});
      schema.items.forEach(item => {
        this.cstByID.set(item.id, item);
        this.schemaByCst.set(item.id, schema);
      });
    });
    let index = STARTING_SUB_INDEX;
    substitutions.forEach(item => {
      this.constituents.add(item.original);
      this.constituents.add(item.substitution);
      this.originals.add(item.original);
      const original = this.cstByID.get(item.original);
      const substitution = this.cstByID.get(item.substitution);
      if (!original || !substitution) {
        return;
      }
      index++;
      const newAlias = `${substitution.alias[0]}${index}`;
      this.mapping.get(original.schema)![original.alias] = newAlias;
      this.mapping.get(substitution.schema)![substitution.alias] = newAlias;
    });
  }

  public validate(): boolean {
    this.calculateSuggestions();
    if (this.substitutions.length === 0) {
      return this.setValid();
    }
    if (!this.checkTypes()) {
      return false;
    }
    if (!this.checkCycles()) {
      return false;
    }
    if (!this.checkSubstitutions()) {
      return false;
    }
    return this.setValid();
  }

  private calculateSuggestions(): void {
    const candidates = new Map<number, string>();
    const minors = new Set<number>();
    const schemaByCst = new Map<number, IRSForm>();
    for (const schema of this.schemas) {
      for (const cst of schema.items) {
        if (this.originals.has(cst.id)) {
          continue;
        }
        if (cst.cst_class === CstClass.BASIC || cst.definition_formal.length === 0) {
          continue;
        }
        const inputs = schema.graph.at(cst.id)!.inputs;
        if (inputs.some(id => !this.constituents.has(id))) {
          continue;
        }
        if (inputs.some(id => this.originals.has(id))) {
          minors.add(cst.id);
        }
        candidates.set(cst.id, applyAliasMapping(cst.definition_formal, this.mapping.get(schema.id)!).replace(' ', ''));
        schemaByCst.set(cst.id, schema);
      }
    }
    for (const [key1, value1] of candidates) {
      for (const [key2, value2] of candidates) {
        if (key1 >= key2) {
          continue;
        }
        if (schemaByCst.get(key1) === schemaByCst.get(key2)) {
          continue;
        }
        if (value1 != value2) {
          continue;
        }
        if (minors.has(key2)) {
          this.suggestions.push({
            original: key2,
            substitution: key1
          });
        } else {
          this.suggestions.push({
            original: key1,
            substitution: key2
          });
        }
      }
    }
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

  private checkSubstitutions(): boolean {
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
      if (original.cst_type === substitution.cst_type && original.cst_class !== CstClass.BASIC) {
        if (!this.checkEqual(original, substitution)) {
          this.reportError(SubstitutionErrorType.unequalExpressions, [substitution.alias, original.alias]);
          // Note: do not interrupt the validation process. Only warn about the problem.
        }
      }

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

  private checkEqual(left: IConstituenta, right: IConstituenta): boolean {
    const schema1 = this.schemaByID.get(left.schema)!;
    const inputs1 = schema1.graph.at(left.id)!.inputs;
    if (inputs1.some(id => !this.constituents.has(id))) {
      return false;
    }
    const schema2 = this.schemaByID.get(right.schema)!;
    const inputs2 = schema2.graph.at(right.id)!.inputs;
    if (inputs2.some(id => !this.constituents.has(id))) {
      return false;
    }
    const expression1 = applyAliasMapping(left.definition_formal, this.mapping.get(schema1.id)!);
    const expression2 = applyAliasMapping(right.definition_formal, this.mapping.get(schema2.id)!);
    return expression1.replace(' ', '') === expression2.replace(' ', '');
  }

  private setValid(): boolean {
    if (this.msg.length > 0) {
      this.msg += '\n';
    }
    this.msg += infoMsg.substitutionsCorrect;
    return true;
  }

  private reportError(errorType: SubstitutionErrorType, params: string[]): boolean {
    if (this.msg.length > 0) {
      this.msg += '\n';
    }
    this.msg += describeSubstitutionError({
      errorType: errorType,
      params: params
    });
    return false;
  }
}

/**
 * Filter relocate candidates from gives schema.
 */
export function getRelocateCandidates(
  source: number,
  destination: number,
  schema: IRSForm,
  oss: IOperationSchema
): IConstituenta[] {
  const destinationSchema = oss.operationByID.get(destination)?.result;
  if (!destinationSchema) {
    return [];
  }
  const node = oss.graph.at(source);
  if (!node) {
    return [];
  }

  const addedCst = schema.items.filter(item => !item.is_inherited);
  if (node.outputs.includes(destination)) {
    return addedCst;
  }

  const unreachableBases: number[] = [];
  for (const cst of schema.items.filter(item => item.is_inherited)) {
    if (cst.parent_schema == destinationSchema) {
      continue;
    }
    const parent = schema.inheritance.find(item => item.child === cst.id && item.child_source === cst.schema)?.parent;
    if (parent) {
      const original = oss.substitutions.find(sub => sub.substitution === parent)?.original;
      if (original) {
        continue;
      }
    }
    unreachableBases.push(cst.id);
  }
  const unreachable = schema.graph.expandAllOutputs(unreachableBases);
  return addedCst.filter(cst => !unreachable.includes(cst.id));
}
