import { type AstNode } from '../../parsing';
import { RSLangAnalyzer, TokenID, TypeID } from '../../rslang';
import { applyAliasMapping, extractGlobals, parseRSLangExpression } from '../../rslang/api';
import { labelType } from '../../rslang/labels';
import { type Constituenta, CstType } from '../rsform';
import { analyzeConstituentType, getCstTypePrefix, isBaseSet, isFunctional, isLogical } from '../rsform-api';

type FormalConstituent = Pick<
  Constituenta,
  'id' | 'alias' | 'cst_type' | 'crucial' | 'value_is_property' | 'definition_formal' | 'typification_manual'
>;

export type RelativizationRole =
  'preserved' | 'carrier' | 'axis' | 'relation' | 'family' | 'callable' | 'condition' | 'predicate' | 'accessor';

export interface TransformedConstituent extends FormalConstituent {
  origin: number | null;
  role: RelativizationRole;
}

interface SourceEdit {
  from: number;
  to: number;
  text: string;
}

interface RewriteContext {
  target: string;
  affected: ReadonlySet<string>;
  slices: ReadonlySet<string>;
  references: ReadonlyMap<string, string>;
  predicates: ReadonlyMap<string, string>;
  accessor: string | null;
  context: string;
  usesAccessor: boolean;
}

const CORE = new Set<CstType>([CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED]);
const BINARY_LOGIC = new Set<AstNode['typeID']>([
  TokenID.LOGIC_AND,
  TokenID.LOGIC_OR,
  TokenID.LOGIC_IMPLICATION,
  TokenID.LOGIC_EQUIVALENT
]);
const GLOBAL_TOKENS = new Set<AstNode['typeID']>([TokenID.ID_GLOBAL, TokenID.ID_FUNCTION, TokenID.ID_PREDICATE]);

function freeName(stem: string, used: ReadonlySet<string>): string {
  if (!used.has(stem)) return stem;
  let suffix = 1;
  while (used.has(stem + suffix)) suffix += 1;
  return stem + suffix;
}

function allocateAliases(
  items: readonly FormalConstituent[],
  additions: readonly FormalConstituent[],
  localConditions: ReadonlySet<string>,
  hasAccessor: boolean
) {
  const counts = new Map<string, number>();
  const allocate = (kind: CstType) => {
    const prefix = getCstTypePrefix(kind);
    const index = (counts.get(prefix) ?? 0) + 1;
    counts.set(prefix, index);
    return prefix + index;
  };
  const output = Object.fromEntries(items.map(item => [item.alias, allocate(item.cst_type)]));
  const generated = new Map(additions.map(item => [item.alias, allocate(CstType.STRUCTURED)]));
  const predicates = new Map([...localConditions].map(alias => [alias, allocate(CstType.PREDICATE)]));
  return { output, generated, predicates, accessor: hasAccessor ? allocate(CstType.FUNCTION) : null };
}

function walk(ast: AstNode | null, visit: (node: AstNode) => void): void {
  if (!ast) return;
  const stack = [ast];
  while (stack.length) {
    const node = stack.pop()!;
    visit(node);
    for (let index = node.children.length - 1; index >= 0; --index) {
      stack.push(node.children[index]);
    }
  }
}

function applyEdits(expression: string, edits: readonly SourceEdit[]): string {
  const chunks: string[] = [];
  let position = 0;
  for (const { from, to, text } of edits) {
    chunks.push(expression.slice(position, from), text);
    position = to;
  }
  chunks.push(expression.slice(position));
  return chunks.join('');
}

/** Index references and analyze the input once for repeated choices on the same schema. */
export function prepareRelativization(items: readonly FormalConstituent[]) {
  const byAlias = new Map(items.map(item => [item.alias, item]));
  if (byAlias.size !== items.length) throw new Error('Duplicate source aliases');
  const analyzer = new RSLangAnalyzer();
  const children = new Map<string, string[]>(items.map(item => [item.alias, []]));
  const indegree = new Map<string, number>();
  const asts = new Map<string, AstNode | null>();
  const locals = new Map<string, Set<string>>();
  const typed = new Set<string>();
  const queue: string[] = [];
  for (const item of items) {
    const { alias, definition_formal: expression } = item;
    const ast = parseRSLangExpression(expression);
    asts.set(alias, ast);
    const names = new Set<string>();
    walk(ast, node => {
      if (node.typeID === TokenID.ID_LOCAL) names.add(expression.slice(node.from, node.to));
    });
    locals.set(alias, names);
    let count = 0;
    const dependencies = new Set([...extractGlobals(expression), ...extractGlobals(item.typification_manual)]);
    for (const dependency of dependencies) {
      const dependents = children.get(dependency);
      if (!dependents) continue;
      dependents.push(alias);
      count += 1;
    }
    indegree.set(alias, count);
    if (count === 0) queue.push(alias);
  }
  for (const alias of queue) {
    const { parse, effectiveType } = analyzeConstituentType(byAlias.get(alias)!, analyzer);
    if (parse.success && effectiveType) {
      typed.add(alias);
    }
    for (const next of children.get(alias)!) {
      const count = indegree.get(next)! - 1;
      indegree.set(next, count);
      if (count === 0) queue.push(next);
    }
  }
  return { items, byAlias, asts, locals, children, typed, analyzer };
}

function rewrite(expression: string, ast: AstNode | null, state: RewriteContext): string {
  const edits: SourceEdit[] = [];
  walk(ast, node => {
    if (node.typeID === TokenID.NT_FUNC_CALL) {
      const [head, firstArgument] = node.children;
      const alias = expression.slice(head.from, head.to);
      if (firstArgument && state.affected.has(alias)) {
        // Visit the name first, then insert before the first argument.
        edits.push({ from: head.from, to: head.to, text: state.references.get(alias)! });
        edits.push({ from: firstArgument.from, to: firstArgument.from, text: state.context + ', ' });
      }
      return;
    }
    if (!GLOBAL_TOKENS.has(node.typeID)) return;
    const alias = expression.slice(node.from, node.to);
    const parent = node.parent;
    if (
      parent?.typeID === TokenID.NT_FUNC_CALL &&
      parent.children[0] === node &&
      parent.children.length > 1 &&
      state.affected.has(alias)
    ) {
      return;
    }
    const name = state.references.get(alias);
    const predicate = state.predicates.get(alias);
    let text = name;
    if (alias === state.target) {
      text = state.context;
    } else if (predicate) {
      text = predicate + '[' + state.context + ']';
    } else if (state.slices.has(alias)) {
      state.usesAccessor = true;
      text = state.accessor + '[' + state.context + ', ' + name + ']';
    }
    if (text && text !== alias) edits.push({ from: node.from, to: node.to, text });
  });
  return applyEdits(expression, edits);
}

export function transformRelativization(
  prepared: ReturnType<typeof prepareRelativization>,
  target: string,
  ignoredAliases: readonly string[]
) {
  const { items, byAlias, asts, locals, children, typed, analyzer } = prepared;
  const ignored = new Set(ignoredAliases);
  const targetItem = byAlias.get(target);
  const contextTypification = analyzer.getType(target);
  if (
    !targetItem ||
    (targetItem.cst_type !== CstType.BASE && targetItem.cst_type !== CstType.STRUCTURED) ||
    !typed.has(target) ||
    !contextTypification ||
    ignored.has(target) ||
    [...ignored].some(alias => !byAlias.has(alias))
  ) {
    return null;
  }

  const seeds = items.filter(item => CORE.has(item.cst_type) && !ignored.has(item.alias));
  const additions = seeds.filter(item => isBaseSet(item.cst_type) && item.alias !== target);
  if (targetItem.cst_type === CstType.BASE) additions.unshift(targetItem);
  const reachable = new Set(seeds.map(item => item.alias));
  const queue = [...reachable];
  for (const alias of queue) {
    for (const next of children.get(alias)!) {
      if (!reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }
  const affected = new Set<string>();
  const slices = new Set<string>();
  const used = new Set<string>();
  for (const alias of reachable) {
    if (alias === target || ignored.has(alias) || !typed.has(alias)) continue;
    affected.add(alias);
    const { cst_type } = byAlias.get(alias)!;
    if (CORE.has(cst_type) || cst_type === CstType.TERM) slices.add(alias);
    for (const local of locals.get(alias)!) used.add(local);
  }
  // Give referenced axioms and statements a predicate for the current context.
  const localConditions = new Set<string>();
  for (const alias of affected) {
    const item = byAlias.get(alias)!;
    if (CORE.has(item.cst_type)) continue;
    for (const dependency of extractGlobals(item.definition_formal)) {
      if (affected.has(dependency) && isLogical(byAlias.get(dependency)!.cst_type)) localConditions.add(dependency);
    }
  }
  const context = freeName('c', used);
  const value = freeName('v', used);
  const graph = 'g';
  const { output, generated, predicates, accessor } = allocateAliases(
    items,
    additions,
    localConditions,
    slices.size > 0
  );
  const references = new Map([...Object.entries(output), ...generated]);
  const axis = references.get(target)!;
  const contextType = applyAliasMapping(labelType(contextTypification), output);
  const contextFactor = contextTypification.typeID === TypeID.collection ? contextType : '(' + contextType + ')';
  const axisDefinition = 'ℬ' + contextFactor;
  const result: TransformedConstituent[] = [];
  const conditionPredicates: TransformedConstituent[] = [];
  const ids = new Set(items.map(item => item.id));
  let nextId = 1;
  function newId(): number {
    while (ids.has(nextId)) nextId += 1;
    const id = nextId;
    nextId += 1;
    return id;
  }

  const state: RewriteContext = {
    target,
    affected,
    slices,
    references,
    predicates,
    accessor,
    context,
    usesAccessor: false
  };
  // Preserve the source domain type when a referenced constituent changes during relativization.
  const changedDomains = new Set([target, ...generated.keys(), ...affected]);
  function stableDomain(alias: string, expression: string): string {
    if ([...extractGlobals(expression)].some(name => changedDomains.has(name)) && typed.has(alias)) {
      const type = analyzer.getType(alias)!;
      const domain = applyAliasMapping(labelType(type), output);
      return type.typeID === TypeID.tuple ? '(' + domain + ')' : domain;
    }
    return applyAliasMapping(expression, output);
  }

  let lastKernelIndex = -1;
  for (const item of items) {
    const { alias, cst_type: kind, definition_formal: expression } = item;
    const ast = asts.get(alias) ?? null;
    let formal: string;
    if (alias === target && kind === CstType.STRUCTURED) {
      formal = axisDefinition;
    } else if (kind === CstType.STRUCTURED && affected.has(alias)) {
      formal = 'ℬ(' + axis + '×' + stableDomain(alias, expression) + ')';
    } else if (kind === CstType.STRUCTURED) {
      formal = stableDomain(alias, expression);
    } else if (!affected.has(alias) || isBaseSet(kind)) {
      formal = applyAliasMapping(expression, output);
    } else {
      const rewritten = rewrite(expression, ast, state);
      if (isFunctional(kind)) {
        const start = rewritten.indexOf('[') + 1;
        formal = rewritten.slice(0, start) + context + '∈' + axis + ', ' + rewritten.slice(start);
      } else if (isLogical(kind)) {
        const predicate = predicates.get(alias);
        let body = rewritten;
        if (predicate) {
          conditionPredicates.push({
            id: newId(),
            alias: predicate,
            cst_type: CstType.PREDICATE,
            definition_formal: '[' + context + '∈' + axis + '] ' + rewritten,
            typification_manual: '',
            origin: item.id,
            role: 'predicate',
            crucial: false,
            value_is_property: false
          });
          body = predicate + '[' + context + ']';
        } else if (ast && BINARY_LOGIC.has(ast.typeID)) {
          body = '(' + rewritten + ')';
        }
        formal = '∀' + context + '∈' + axis + ' ' + body;
      } else {
        formal =
          'I{(' + context + ', ' + value + ') | ' + context + ':∈' + axis + '; ' + value + ':=' + rewritten + '}';
      }
    }
    let role: RelativizationRole = 'preserved';
    if (generated.has(alias)) role = 'carrier';
    else if (alias === target) role = 'axis';
    else if (affected.has(alias)) {
      if (kind === CstType.STRUCTURED) role = 'relation';
      else if (kind === CstType.TERM) role = 'family';
      else if (isFunctional(kind)) role = 'callable';
      else if (isLogical(kind)) role = 'condition';
    }
    result.push({
      ...item,
      alias: output[alias],
      definition_formal: formal,
      typification_manual: applyAliasMapping(item.typification_manual, output),
      origin: item.id,
      role
    });
    if (CORE.has(kind)) lastKernelIndex = result.length - 1;
  }

  const added = additions.map<TransformedConstituent>(item => ({
    ...item,
    id: newId(),
    alias: generated.get(item.alias)!,
    cst_type: CstType.STRUCTURED,
    definition_formal: item.alias === target ? axisDefinition : 'ℬ(' + axis + '×ℬ(' + output[item.alias] + '))',
    typification_manual: '',
    origin: item.id,
    role: item.alias === target ? 'axis' : 'relation'
  }));
  const ordered = [
    ...result.slice(0, lastKernelIndex + 1),
    ...added,
    ...result.slice(lastKernelIndex + 1),
    ...conditionPredicates
  ];
  if (state.usesAccessor && accessor) {
    ordered.push({
      id: newId(),
      cst_type: CstType.FUNCTION,
      alias: accessor,
      origin: null,
      role: 'accessor',
      crucial: false,
      value_is_property: false,
      typification_manual: '',
      definition_formal: `[${context}∈${axis}, ${graph}∈ℬ(${axis}×R1)] debool(Pr2(Fi1[{${context}}](${graph})))`
    });
  }
  return { items: ordered, context };
}
