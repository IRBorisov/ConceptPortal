import { type TermContext } from '@rsconcept/domain/cctext';
import { extractEntities, parseGrammemes, resolveTextReferences } from '@rsconcept/domain/cctext/language-api';
import { Graph } from '@rsconcept/domain/graph';

import { type ConstituentaBasicsDTO } from '@/features/rsform';

export interface TextChangeOptions {
  termChanged: boolean;
  termRawChanged: boolean;
  definitionRawChanged: boolean;
  clearTargetForms: boolean;
}

export function resolveAllConstituentTexts(items: ConstituentaBasicsDTO[]): void {
  const graphTerm = buildReferenceGraph(items, 'term_raw');
  const idToItem = new Map(items.map(item => [item.id, item]));
  const context = buildTermContext(items);

  for (const id of graphTerm.topologicalOrder()) {
    const row = idToItem.get(id);
    if (!row) {
      continue;
    }
    const resolved = resolveTextReferences(row.term_raw, context);
    if (resolved !== row.term_resolved) {
      row.term_resolved = resolved;
      row.term_forms = [];
      context[row.alias] = { nominal: row.term_resolved, forms: [] };
    }
  }

  for (const row of items) {
    row.definition_resolved = resolveTextReferences(row.definition_raw, context);
  }
}

export function resolveConstituentTextChange(
  items: ConstituentaBasicsDTO[],
  targetID: number,
  options: TextChangeOptions
): void {
  const idToItem = new Map(items.map(item => [item.id, item]));
  const target = idToItem.get(targetID);
  if (!target) {
    throw new Error(`resolveConstituentTextChange: unknown target ${targetID}`);
  }

  const context = buildTermContext(items);
  if (options.termRawChanged) {
    target.term_resolved = resolveTextReferences(target.term_raw, context);
    if (options.clearTargetForms) {
      target.term_forms = [];
    }
    context[target.alias] = toContextItem(target);
  } else if (options.termChanged) {
    context[target.alias] = toContextItem(target);
  }

  if (options.definitionRawChanged && !options.termChanged) {
    target.definition_resolved = resolveTextReferences(target.definition_raw, context);
  }

  if (!options.termChanged) {
    return;
  }

  const graphTerm = buildReferenceGraph(items, 'term_raw');
  const graphText = buildReferenceGraph(items, 'definition_raw');
  const expansion = graphTerm.expandAllOutputs([targetID]);
  const expansionSet = new Set(expansion);

  for (const id of graphTerm.topologicalOrder()) {
    if (!expansionSet.has(id)) {
      continue;
    }
    const expanded = idToItem.get(id);
    if (!expanded) {
      continue;
    }
    const resolved = resolveTextReferences(expanded.term_raw, context);
    if (resolved !== expanded.term_resolved) {
      expanded.term_resolved = resolved;
      expanded.term_forms = [];
      context[expanded.alias] = { nominal: expanded.term_resolved, forms: [] };
    }
  }

  const updateDefs = new Set([targetID, ...expansion, ...graphText.expandAllOutputs([targetID, ...expansion])]);
  for (const item of items) {
    if (updateDefs.has(item.id)) {
      item.definition_resolved = resolveTextReferences(item.definition_raw, context);
    }
  }
}

// ====== Internals =======

function buildReferenceGraph(items: ConstituentaBasicsDTO[], field: 'definition_raw' | 'term_raw'): Graph<number> {
  const graph = new Graph<number>();
  const idByAlias = new Map(items.map(row => [row.alias, row.id]));
  for (const row of items) {
    graph.addNode(row.id);
  }
  for (const row of items) {
    for (const entity of extractEntities(row[field])) {
      const source = idByAlias.get(entity);
      if (source !== undefined) {
        graph.addEdge(source, row.id);
      }
    }
  }
  return graph;
}

function buildTermContext(items: ConstituentaBasicsDTO[]): TermContext {
  const context: TermContext = {};
  for (const row of items) {
    context[row.alias] = toContextItem(row);
  }
  return context;
}

function toContextItem(row: ConstituentaBasicsDTO): TermContext[string] {
  return {
    nominal: row.term_resolved,
    forms: row.term_forms.map(form => ({ text: form.text, grams: parseGrammemes(form.tags) }))
  };
}
