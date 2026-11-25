import { ReferenceType, type TermContext } from '../../cctext/language';
import {
  applyEntityReferenceMapping,
  extractEntities,
  parseGrammemes,
  parseReference,
  resolveTextReferences
} from '../../cctext/language-api';
import { type AstNode, getNodeIndices } from '../../parsing';
import { RSLangAnalyzer, TokenID, TypeID } from '../../rslang';
import { extractGlobals, parseRSLangExpression } from '../../rslang/api';
import { labelType } from '../../rslang/labels';
import { type Attribution, type Constituenta, CstType, type RSForm } from '../rsform';
import { analyzeSchemaConstituents, buildFormalDependencyGraph, restoreConstituentOrder } from '../rsform-api';
import { StructurePlanner } from '../structure-planner';

import {
  prepareRelativization,
  type RelativizationRole,
  type TransformedConstituent,
  transformRelativization
} from './engine';
import { type ProposalFields, proposeText, type TextLocale } from './proposal-text';

export type { ProposalFields, RelativizationRole, TextLocale };

export type RelativizationItem = Pick<
  Constituenta,
  | 'id'
  | 'alias'
  | 'convention'
  | 'cst_type'
  | 'crucial'
  | 'value_is_property'
  | 'definition_formal'
  | 'typification_manual'
  | 'definition_raw'
  | 'definition_resolved'
  | 'term_raw'
  | 'term_resolved'
  | 'term_forms'
>;

interface ProjectionSource {
  items: RelativizationItem[];
  attribution: Attribution[];
}

export interface ProjectionOptions {
  target: number;
  excluded: number[];
  locale: TextLocale;
  contextName: string;
}

interface ComponentOrigin {
  source: string;
  path: readonly number[];
  scope: 'context' | 'value';
  term: string;
}

export interface RelativizationProposal {
  id: number;
  origin: number | null;
  role: RelativizationRole;
  sourceAlias: string | null;
  before: ProposalFields;
  beforeType: string;
  afterType: string;
  component: ComponentOrigin | null;
  coordinates: { scope: 'context' | 'value'; path: readonly number[]; label: string }[];
  ambiguous: string[];
  missing: (keyof ProposalFields)[];
  inKernel: boolean;
  changed: boolean;
  formalInvalid: boolean;
}

export type RelativizationProjection = ProjectionSource & {
  proposals: RelativizationProposal[];
};

const core = new Set<CstType>([CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED]);

function analyze(items: RelativizationItem[]) {
  // Schema analysis fills transient fields on these copies.
  const rows = items.map(item => ({ ...item })) as Constituenta[];
  const graph = buildFormalDependencyGraph(rows);
  const cstByID = new Map(rows.map(item => [item.id, item]));
  const cstByAlias = new Map(rows.map(item => [item.alias, item]));
  const schema = { items: rows, graph, cstByID, cstByAlias, analyzer: new RSLangAnalyzer() };
  analyzeSchemaConstituents(schema);
  return schema;
}

function fields(item?: RelativizationItem): ProposalFields {
  return {
    term_raw: item?.term_raw ?? '',
    definition_raw: item?.definition_raw ?? '',
    convention: item?.convention ?? ''
  };
}

function transferText(
  value: string,
  resolved: string | undefined,
  mapping: Record<string, string>,
  terms: TermContext,
  ambiguous: Set<string>
): string {
  const aliases = extractEntities(value);
  const frozen = aliases.filter(alias => !Object.hasOwn(mapping, alias) || !mapping[alias]);
  for (const alias of frozen) ambiguous.add(alias);
  if (!frozen.length) return applyEntityReferenceMapping(value, mapping);

  // Offsets for agreement refer to other references. Keep the original wording
  // when freezing an entity would change what an offset points to.
  const references = [...value.matchAll(/@{[^{}]*?}/g)];
  if (references.some(([token]) => parseReference(token)?.type === ReferenceType.SYNTACTIC)) {
    for (const alias of aliases) ambiguous.add(alias);
    return resolved || resolveTextReferences(value, terms);
  }
  const toFreeze = new Set(frozen);
  const updated = value.replace(/@{[^{}]*?}/g, token => {
    const ref = parseReference(token);
    if (ref?.type !== ReferenceType.ENTITY || !toFreeze.has(ref.data.entity)) return token;
    return terms[ref.data.entity]?.nominal ? resolveTextReferences(token, terms) : token;
  });
  return applyEntityReferenceMapping(updated, mapping);
}

function typeText(type: Constituenta['effectiveType'] | undefined) {
  return type ? labelType(type) : '';
}

function inspectComponent(
  original: Constituenta | undefined,
  after: Constituenta,
  originalByID: Map<number, Constituenta>,
  resultByAlias: Map<string, TransformedConstituent>,
  accessor: string | undefined,
  context: string,
  target: number
): ComponentOrigin | null {
  if (!original?.spawner_path?.length || !original.spawner || !after.analysis.success) return null;
  const source = originalByID.get(original.spawner);
  if (!source) return null;
  const scope = source.id === target ? 'context' : 'value';
  const sourceType = source.effectiveType;
  const isCollection =
    sourceType?.typeID === TypeID.collection ||
    (sourceType?.typeID === TypeID.function && sourceType.result.typeID === TypeID.collection);
  const originalSteps = original.spawner_path.slice(isCollection ? 1 : 0);
  const resultSteps = traceComponent(after.definition_formal, source.id, target, resultByAlias, accessor, context);
  if (resultSteps?.length !== originalSteps.length || resultSteps.some((step, index) => step !== originalSteps[index]))
    return null;
  return {
    source: source.alias,
    path: original.spawner_path,
    scope,
    term: original.term_resolved || original.term_raw
  };
}

function traceComponent(
  expression: string,
  sourceID: number,
  targetID: number,
  rows: Map<string, TransformedConstituent>,
  accessor: string | undefined,
  context: string,
  visited = new Set<string>()
): number[] | null {
  const root = parseRSLangExpression(expression);
  const spelling = (node: AstNode) => expression.slice(node.from, node.to);
  let node =
    root?.typeID === TokenID.NT_IMPERATIVE_EXPR
      ? root.children.find(child => child.typeID === TokenID.ASSIGN)?.children[1]
      : root?.typeID === TokenID.NT_FUNC_DEFINITION
        ? root.children[1]
        : undefined;
  const reversed: number[] = [];
  while (node) {
    if (node.typeID === TokenID.REDUCE) {
      reversed.push(0);
    } else if (node.typeID === TokenID.BIGPR || node.typeID === TokenID.SMALLPR) {
      const indices = getNodeIndices(node);
      if (indices.length !== 1) return null;
      reversed.push(indices[0]);
    } else {
      break;
    }
    node = node.children[0];
  }
  if (!node) return null;
  const suffix = reversed.reverse();
  if (sourceID === targetID && node.typeID === TokenID.ID_LOCAL && spelling(node) === context) return suffix;
  if (node.typeID !== TokenID.NT_FUNC_CALL || node.children.length !== 3) return null;
  const [fn, arg, value] = node.children;
  if (spelling(fn) !== accessor || spelling(arg) !== context) return null;
  const alias = spelling(value);
  const row = rows.get(alias);
  if (!row || visited.has(alias)) return null;
  if (row.origin === sourceID && (row.role === 'relation' || row.role === 'family')) return suffix;
  visited.add(alias);
  const prefix = traceComponent(row.definition_formal, sourceID, targetID, rows, accessor, context, visited);
  return prefix ? [...prefix, ...suffix] : null;
}

export function projectRelativization(
  source: ProjectionSource,
  options: ProjectionOptions
): RelativizationProjection | null {
  const before = analyze(source.items);
  const target = before.cstByID.get(options.target);
  if (!target || (target.cst_type !== CstType.BASE && target.cst_type !== CstType.STRUCTURED)) return null;
  const excluded = options.excluded.map(id => before.cstByID.get(id));
  if (
    new Set(options.excluded).size !== excluded.length ||
    excluded.some(item => !item || !core.has(item.cst_type) || item.id === target.id)
  ) {
    return null;
  }
  const transformed = transformRelativization(
    prepareRelativization(source.items),
    target.alias,
    excluded.map(item => item!.alias)
  );
  if (!transformed) return null;

  const baselineByOrigin = new Map(
    transformed.items.filter(row => row.origin === row.id).map(row => [row.origin!, row])
  );
  const stableAliases = Object.fromEntries(
    source.items.map(item => {
      const row = baselineByOrigin.get(item.id);
      return [item.alias, row?.role === 'preserved' || row?.role === 'carrier' ? row.alias : ''];
    })
  );
  const terms: TermContext = Object.fromEntries(
    source.items.map(item => [
      item.alias,
      {
        nominal: item.term_resolved || item.term_raw,
        forms: item.term_forms.map(form => ({ text: form.text, grams: parseGrammemes(form.tags) }))
      }
    ])
  );
  const items = transformed.items.map<RelativizationItem>(row => ({
    id: row.id,
    alias: row.alias,
    cst_type: row.cst_type,
    crucial: row.crucial,
    value_is_property: row.value_is_property,
    definition_formal: row.definition_formal,
    typification_manual: row.role === 'preserved' || row.role === 'carrier' ? row.typification_manual : '',
    ...fields(),
    term_resolved: '',
    term_forms: [],
    definition_resolved: ''
  }));
  const after = analyze(items);
  const roots = after.items.filter(item => core.has(item.cst_type) || item.cst_type === CstType.AXIOM);
  const kernel = new Set([...roots.map(item => item.id), ...after.graph.expandAllInputs(roots.map(item => item.id))]);
  const byAlias = new Map(transformed.items.map(row => [row.alias, row]));
  const accessor = transformed.items.find(row => row.role === 'accessor');
  const orderedItems = restoreConstituentOrder(items, after.graph);
  const proposals = orderedItems.map<RelativizationProposal>(pending => {
    const row = byAlias.get(pending.alias)!;
    const original = row.origin === null ? undefined : before.cstByID.get(row.origin);
    const old = fields(original);
    const computed = after.cstByID.get(pending.id)!;
    const component = inspectComponent(
      original,
      computed,
      before.cstByID,
      byAlias,
      accessor?.alias,
      transformed.context,
      target.id
    );
    const ambiguous = new Set<string>();
    const renamed = (text: string, resolved?: string) => transferText(text, resolved, stableAliases, terms, ambiguous);
    const originalText = {
      term_raw: renamed(old.term_raw, original?.term_resolved),
      definition_raw: renamed(old.definition_raw, original?.definition_resolved),
      convention: renamed(old.convention)
    };
    const changedMeaning = row.role !== 'carrier' && row.role !== 'preserved';
    const usesAccessor = !!accessor && extractGlobals(row.definition_formal).has(accessor.alias);
    const proposed = proposeText(
      row.role,
      originalText,
      {
        meaning: originalText.term_raw,
        context: options.contextName,
        component: component?.term ?? '',
        subject: target.term_resolved || target.term_raw || target.alias,
        isBaseSet: original?.cst_type === CstType.BASE || original?.cst_type === CstType.CONSTANT
      },
      options.locale,
      usesAccessor
    );

    Object.assign(pending, proposed);
    if (
      original &&
      !changedMeaning &&
      (originalText.term_raw === applyEntityReferenceMapping(old.term_raw, stableAliases) ||
        originalText.term_raw === original.term_resolved)
    ) {
      pending.term_resolved = original.term_resolved;
      pending.term_forms = original.term_forms;
    }

    const beforeType = typeText(original?.effectiveType);
    const afterType = typeText(computed.effectiveType);
    const missing: (keyof ProposalFields)[] = [];
    if (changedMeaning && original && !old.term_raw.trim()) missing.push('term_raw');
    if (changedMeaning && original && core.has(original.cst_type) && !old.convention.trim()) missing.push('convention');

    const coordinates: RelativizationProposal['coordinates'] = [];
    if ((row.role === 'relation' || row.role === 'family') && computed.effectiveType) {
      for (const node of new StructurePlanner(after as RSForm, computed).build()) {
        if (node.path.length === 2 && node.path[0] === 0) {
          const context = node.path[1] === 1;
          coordinates.push({
            path: node.path,
            scope: context ? 'context' : 'value',
            label: context ? options.contextName : component?.term || original?.term_resolved || ''
          });
        }
      }
    }
    const changed =
      changedMeaning ||
      beforeType !== afterType ||
      Object.entries(old).some(([field, value]) => proposed[field as keyof ProposalFields] !== value) ||
      (!!original && original.definition_formal !== pending.definition_formal);
    const losesComputability =
      computed.analysis.valueClass === null &&
      (row.role === 'accessor' || (changedMeaning && original?.analysis.valueClass != null));
    const failsAnalysis =
      !computed.analysis.success &&
      (row.role === 'accessor' || (changedMeaning && original?.analysis.success === true));
    return {
      id: pending.id,
      origin: row.origin,
      role: row.role,
      sourceAlias: original?.alias ?? null,
      before: old,
      beforeType,
      afterType,
      component,
      coordinates,
      ambiguous: [...ambiguous],
      missing,
      inKernel: kernel.has(pending.id),
      changed,
      formalInvalid: losesComputability || failsAnalysis
    };
  });

  return { items: orderedItems, attribution: source.attribution, proposals };
}
