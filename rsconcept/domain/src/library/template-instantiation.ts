/**
 * Module: template instantiation from the expression bank into a target {@link RSForm}.
 */

import { type AstNode, visitAstDFS } from '../parsing';
import {
  type AliasMapping,
  applyAliasMapping,
  isGlobalAlias,
  parseRSLangExpression,
  splitTemplateDefinition,
  substituteLocalAliases,
  substituteTemplateArgs
} from '../rslang/api';
import { labelType } from '../rslang/labels';
import { TokenID } from '../rslang/parser/token';
import { TypeID } from '../rslang/semantic/typification';

import { type ArgumentValue, type Constituenta, type CstType, type RSForm } from './rsform';
import {
  applyMappingToConstituents,
  argumentValuesToMapping,
  generateAlias,
  inferTemplatedType,
  isFunctional,
  normalizeExpression
} from './rsform-api';

/**
 * Payload for one {@link Constituenta} to create when instantiating an expression-bank template.
 *
 * Aliases are generated for the target schema. Formal definitions and typifications already
 * reflect user argument substitution and remapping of bank aliases to those new aliases.
 */
export interface TemplateInstantiationItem {
  /** Alias to assign in the target schema. */
  alias: string;
  /** Inferred type after argument substitution (function/predicate may become term/axiom). */
  cst_type: CstType;
  crucial: boolean;
  convention: string;
  definition_formal: string;
  definition_raw: string;
  term_raw: string;
  term_forms: Constituenta['term_forms'];
  typification_manual: string;
  value_is_property: boolean;
}

/** Conflicting argument bindings inferred for the same template dependency. */
export interface TemplateBindingConflict {
  templateAlias: string;
  paramAlias: string;
  existing: string;
  incoming: string;
}

/**
 * Batch create plan: dependencies first, selected template constituent last.
 *
 * Reuses constituents whose substituted formal definition already exists in the target schema
 * (normalized comparison), even when the bank alias differs from the matched target alias.
 * {@link TemplateInstantiationPlan.mainDuplicateAlias} reports when the selected template is a duplicate.
 * Does not set `insert_after`; the caller supplies insertion on the batch DTO.
 */
export interface TemplateInstantiationPlan {
  items: TemplateInstantiationItem[];
  /** Set when the selected template expression already exists in the target schema. */
  mainDuplicateAlias: string | null;
  /** Set when nested template calls bind the same parameter to different global aliases. */
  bindingConflict: TemplateBindingConflict | null;
}

/**
 * Input for planning template instantiation into a conceptual schema.
 */
export interface TemplateInstantiationInput {
  /** Schema that will receive new constituents. */
  targetSchema: RSForm;
  /** All constituents of the selected expression-bank RSForm (not only the prototype). */
  templateItems: Constituenta[];
  /** Template constituent chosen in the UI (main expression to add). */
  prototype: Constituenta;
  /** User bindings from template parameter aliases to target-schema global aliases. */
  userArgs: ArgumentValue[];
  /**
   * Main constituent attributes from the create dialog (alias, labels, flags).
   * `definition_formal` and `cst_type` may be overridden from `prototype` and `userArgs`.
   */
  mainItem: TemplateInstantiationItem;
}

interface FuncCallRef {
  callee: string;
  args: string[];
}

interface TemplateParam {
  alias: string;
  typification: string;
}

/**
 * Build a batch create plan for a template expression and its bank dependencies.
 *
 * Walks nested `F#` / `P#` calls in the substituted expression, collects missing term-functions
 * and predicate-functions from `templateItems`, propagates argument bindings into nested calls,
 * topologically orders dependencies, and remaps bank aliases to freshly generated target aliases.
 */
export function planTemplateInstantiation(input: TemplateInstantiationInput): TemplateInstantiationPlan {
  return new TemplateInstantiationPlanner(input).plan();
}

/**
 * Stateful planner for {@link planTemplateInstantiation}.
 *
 * Prefer the function wrapper unless you need to hold or reuse planner state between calls.
 */
export class TemplateInstantiationPlanner {
  private readonly targetSchema: RSForm;
  private readonly prototype: Constituenta;
  private readonly userArgs: ArgumentValue[];
  private readonly mainItemTemplate: TemplateInstantiationItem;
  private readonly templateByAlias: Map<string, Constituenta>;
  private readonly userMapping: AliasMapping;
  private readonly depBindings = new Map<string, Map<string, string>>();
  private readonly depRefs = new Map<string, Set<string>>();
  private bindingConflict: TemplateBindingConflict | null = null;

  /** @param input - See {@link TemplateInstantiationInput}. */
  constructor(input: TemplateInstantiationInput) {
    this.targetSchema = input.targetSchema;
    this.prototype = input.prototype;
    this.userArgs = input.userArgs;
    this.mainItemTemplate = input.mainItem;
    this.templateByAlias = new Map(
      input.templateItems.filter(cst => isFunctional(cst.cst_type)).map(cst => [cst.alias, cst])
    );
    this.userMapping = argumentValuesToMapping(input.userArgs);
  }

  /** @returns Dependency items in topological order, then the main template item when it is not a duplicate. */
  plan(): TemplateInstantiationPlan {
    const mainDefinition = substituteTemplateArgs(this.prototype.definition_formal, this.userMapping);
    this.collectDependencies(mainDefinition, this.userMapping);

    if (this.bindingConflict) {
      return { items: [], mainDuplicateAlias: null, bindingConflict: this.bindingConflict };
    }

    const definitionIndex = createFormalDefinitionIndex(this.targetSchema);
    const dependencyItems = this.buildDependencyItems(definitionIndex);
    const { item: mainItem, duplicateAlias: mainDuplicateAlias } = this.buildMainItem(
      mainDefinition,
      dependencyItems.takenAliases,
      dependencyItems.aliasMapping,
      definitionIndex
    );

    return {
      items: mainItem ? [...dependencyItems.items, mainItem] : dependencyItems.items,
      mainDuplicateAlias,
      bindingConflict: null
    };
  }

  private buildDependencyItems(definitionIndex: FormalDefinitionIndex): {
    items: TemplateInstantiationItem[];
    aliasMapping: AliasMapping;
    takenAliases: string[];
  } {
    const dependencyAliases = topologicalSort([...this.depBindings.keys()], this.depRefs);
    const aliasMapping: AliasMapping = {};
    const takenAliases: string[] = [];
    const reservedAliases = [this.mainItemTemplate.alias];
    const items: TemplateInstantiationItem[] = [];

    for (const templateAlias of dependencyAliases) {
      const template = this.templateByAlias.get(templateAlias)!;
      const bindings = this.depBindings.get(templateAlias)!;
      const args = bindingMapToArgs(getTemplateParams(template), bindings);
      const cst_type = inferTemplatedType(template.cst_type, args);
      const definition = applyAliasMapping(
        substituteTemplateArgs(template.definition_formal, argumentValuesToMapping(args)),
        aliasMapping
      );

      const existingAlias = definitionIndex.find(cst_type, definition);
      if (existingAlias) {
        aliasMapping[templateAlias] = existingAlias;
        continue;
      }

      const alias = generateAlias(template.cst_type, this.targetSchema, [...reservedAliases, ...takenAliases]);
      takenAliases.push(alias);
      aliasMapping[templateAlias] = alias;

      const item = instantiateTemplateItem(template, args, alias);
      item.definition_formal = definition;
      applyMappingToConstituents([item], aliasMapping, false);
      definitionIndex.register(cst_type, item.definition_formal, alias);
      items.push(item);
    }

    return { items, aliasMapping, takenAliases };
  }

  private buildMainItem(
    mainDefinition: string,
    takenAliases: string[],
    aliasMapping: AliasMapping,
    definitionIndex: FormalDefinitionIndex
  ): { item: TemplateInstantiationItem | null; duplicateAlias: string | null } {
    const mappedDefinition = applyAliasMapping(mainDefinition, aliasMapping);
    const cst_type = inferTemplatedType(this.prototype.cst_type, this.userArgs);

    const duplicateAlias = definitionIndex.find(cst_type, mappedDefinition);
    if (duplicateAlias) {
      return { item: null, duplicateAlias };
    }

    const mainItem: TemplateInstantiationItem = {
      ...this.mainItemTemplate,
      definition_formal: mappedDefinition,
      cst_type
    };
    applyMappingToConstituents([mainItem], aliasMapping, false);

    if (takenAliases.includes(mainItem.alias)) {
      mainItem.alias = generateAlias(mainItem.cst_type, this.targetSchema, [
        ...takenAliases,
        this.mainItemTemplate.alias
      ]);
    }

    return { item: mainItem, duplicateAlias: null };
  }

  private ensureDep(templateAlias: string, bindings: Map<string, string>, referrer?: string): void {
    if (this.bindingConflict) {
      return;
    }
    if (!this.templateByAlias.has(templateAlias)) {
      return;
    }
    if (referrer && this.depBindings.has(referrer)) {
      const refs = this.depRefs.get(referrer) ?? new Set<string>();
      refs.add(templateAlias);
      this.depRefs.set(referrer, refs);
    }
    const mergeResult = mergeBindings(this.depBindings.get(templateAlias), bindings);
    if (!mergeResult.ok) {
      this.bindingConflict = { templateAlias, ...mergeResult.conflict };
      return;
    }
    const merged = mergeResult.bindings;
    const changed =
      !this.depBindings.has(templateAlias) || merged.size !== (this.depBindings.get(templateAlias)?.size ?? 0);
    this.depBindings.set(templateAlias, merged);
    if (!changed && referrer) {
      return;
    }
    const template = this.templateByAlias.get(templateAlias)!;
    const args = bindingMapToArgs(getTemplateParams(template), merged);
    const definition = substituteTemplateArgs(template.definition_formal, argumentValuesToMapping(args));
    this.collectDependencies(definition, argumentValuesToMapping(args), templateAlias);
  }

  private collectDependencies(expression: string, scope: AliasMapping, referrer?: string): void {
    if (this.bindingConflict) {
      return;
    }
    const ast = parseRSLangExpression(expression);
    if (!ast) {
      return;
    }
    for (const call of extractFuncCalls(ast, expression)) {
      const template = this.templateByAlias.get(call.callee);
      if (!template) {
        continue;
      }
      const scopedArgs = call.args.map(arg => substituteLocalAliases(arg, scope));
      const bindings = bindingsFromCall(getTemplateParams(template), scopedArgs, scope);
      this.ensureDep(call.callee, bindings, referrer);
    }
  }
}

// ======= Internals ========

/** Normalized formal definitions in the target schema and in the current plan. */
class FormalDefinitionIndex {
  private readonly byKey = new Map<string, string>();

  register(cst_type: CstType, definition_formal: string, alias: string): void {
    const normalized = normalizeExpression(definition_formal, cst_type);
    if (!normalized) {
      return;
    }
    this.byKey.set(formalDefinitionKey(cst_type, normalized), alias);
  }

  find(cst_type: CstType, definition_formal: string): string | null {
    const normalized = normalizeExpression(definition_formal, cst_type);
    if (!normalized) {
      return null;
    }
    return this.byKey.get(formalDefinitionKey(cst_type, normalized)) ?? null;
  }
}

function createFormalDefinitionIndex(schema: RSForm): FormalDefinitionIndex {
  const index = new FormalDefinitionIndex();
  for (const cst of schema.items) {
    index.register(cst.cst_type, cst.definition_formal, cst.alias);
  }
  return index;
}

function formalDefinitionKey(cst_type: CstType, normalized: string): string {
  return `${cst_type}\0${normalized}`;
}

function instantiateTemplateItem(
  template: Constituenta,
  args: ArgumentValue[],
  alias: string
): TemplateInstantiationItem {
  return {
    alias,
    cst_type: inferTemplatedType(template.cst_type, args),
    crucial: template.crucial,
    convention: template.convention,
    definition_formal: substituteTemplateArgs(template.definition_formal, argumentValuesToMapping(args)),
    definition_raw: template.definition_raw,
    term_raw: template.term_raw,
    term_forms: [...template.term_forms],
    typification_manual: template.typification_manual,
    value_is_property: template.value_is_property
  };
}

function bindingsFromCall(params: TemplateParam[], callArgs: string[], scope: AliasMapping): Map<string, string> {
  const bindings = new Map<string, string>();
  params.forEach((param, index) => {
    const value = resolveArgBinding(callArgs[index] ?? '', scope);
    if (value) {
      bindings.set(param.alias, value);
    }
  });
  return bindings;
}

function resolveArgBinding(argExpr: string, scope: AliasMapping): string | undefined {
  const scoped = substituteLocalAliases(argExpr, scope).trim();
  if (isGlobalAlias(scoped)) {
    return scoped;
  }
  return undefined;
}

type MergeBindingsResult =
  | { ok: true; bindings: Map<string, string> }
  | { ok: false; conflict: { paramAlias: string; existing: string; incoming: string } };

function mergeBindings(existing: Map<string, string> | undefined, incoming: Map<string, string>): MergeBindingsResult {
  const result = new Map(existing);
  for (const [alias, value] of incoming) {
    const existingValue = result.get(alias);
    if (existingValue === undefined) {
      result.set(alias, value);
    } else if (existingValue !== value) {
      return { ok: false, conflict: { paramAlias: alias, existing: existingValue, incoming: value } };
    }
  }
  return { ok: true, bindings: result };
}

function bindingMapToArgs(params: TemplateParam[], bindings: Map<string, string>): ArgumentValue[] {
  return params.map(param => ({
    alias: param.alias,
    typification: param.typification,
    value: bindings.get(param.alias)
  }));
}

function getTemplateParams(template: Constituenta): TemplateParam[] {
  const effectiveType = template.effectiveType;
  if (effectiveType && (effectiveType.typeID === TypeID.function || effectiveType.typeID === TypeID.predicate)) {
    return effectiveType.args.map(arg => ({
      alias: arg.alias,
      typification: labelType(arg.type)
    }));
  }
  const { head } = splitTemplateDefinition(template.definition_formal);
  if (!head) {
    return [];
  }
  return head.split(',').map(part => {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('∈');
    if (separator === -1) {
      return { alias: trimmed, typification: '' };
    }
    return {
      alias: trimmed.slice(0, separator).trim(),
      typification: trimmed.slice(separator + 1).trim()
    };
  });
}

function extractFuncCalls(ast: AstNode, expression: string): FuncCallRef[] {
  const result: FuncCallRef[] = [];
  visitAstDFS(ast, node => {
    if (node.typeID !== TokenID.NT_FUNC_CALL || node.children.length < 1) {
      return;
    }
    const calleeNode = node.children[0];
    if (
      calleeNode.typeID !== TokenID.ID_FUNCTION &&
      calleeNode.typeID !== TokenID.ID_PREDICATE &&
      calleeNode.typeID !== TokenID.ID_GLOBAL
    ) {
      return;
    }
    const callee = expression.slice(calleeNode.from, calleeNode.to);
    if (!/^[FP]\d+$/.test(callee)) {
      return;
    }
    result.push({
      callee,
      args: node.children.slice(1).map(child => expression.slice(child.from, child.to).trim())
    });
  });
  return result;
}

function topologicalSort(aliases: string[], refs: Map<string, Set<string>>): string[] {
  const remaining = new Set(aliases);
  const sorted: string[] = [];
  while (remaining.size > 0) {
    const ready = [...remaining].filter(alias => {
      const deps = refs.get(alias) ?? new Set<string>();
      return [...deps].every(dep => !remaining.has(dep));
    });
    if (ready.length === 0) {
      return [...remaining, ...sorted].reverse();
    }
    ready.sort();
    for (const alias of ready) {
      sorted.push(alias);
      remaining.delete(alias);
    }
  }
  return sorted;
}
