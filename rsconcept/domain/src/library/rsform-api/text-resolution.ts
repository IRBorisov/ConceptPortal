/**
 * Cascade resolution of constituenta term/definition entity references.
 * Matches backend {@code RSForm.resolve_all_text} / {@code resolve_term_change}.
 */

import { type TermContext } from '../../cctext/language';
import { extractEntities, parseGrammemes, resolveTextReferences } from '../../cctext/language-api';
import { Graph } from '../../graph';

import { type ResolvableConstituenta } from './types';

/** Options controlling which texts to re-resolve after an edit. */
export interface TextChangeOptions {
  termChanged: boolean;
  termRawChanged: boolean;
  definitionRawChanged: boolean;
  clearTargetForms: boolean;
}

/** Build term-reference graph: referenced constituent → dependent (backend {@code graph_term}). */
export function buildTermReferenceGraph(items: readonly ResolvableConstituenta[]): Graph<number> {
  return buildReferenceGraph(items, 'term_raw');
}

/** Build definition-reference graph: referenced constituent → dependent (backend {@code graph_text}). */
export function buildDefinitionReferenceGraph(items: readonly ResolvableConstituenta[]): Graph<number> {
  return buildReferenceGraph(items, 'definition_raw');
}

/** Resolve all term and definition texts in topological order. Mutates items in place. */
export function resolveAllConstituentTexts(items: ResolvableConstituenta[]): void {
  const graphTerm = buildTermReferenceGraph(items);
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

/**
 * Resolve texts after a single constituent change, cascading dependents when the term changed.
 * Mutates items in place.
 */
export function resolveConstituentTextChange(
  items: ResolvableConstituenta[],
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

  const graphTerm = buildTermReferenceGraph(items);
  const graphText = buildDefinitionReferenceGraph(items);
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

function buildReferenceGraph(
  items: readonly ResolvableConstituenta[],
  field: 'definition_raw' | 'term_raw'
): Graph<number> {
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

function buildTermContext(items: readonly ResolvableConstituenta[]): TermContext {
  const context: TermContext = {};
  for (const row of items) {
    context[row.alias] = toContextItem(row);
  }
  return context;
}

function toContextItem(row: ResolvableConstituenta): TermContext[string] {
  return {
    nominal: row.term_resolved,
    forms: row.term_forms.map(form => ({ text: form.text, grams: parseGrammemes(form.tags) }))
  };
}
