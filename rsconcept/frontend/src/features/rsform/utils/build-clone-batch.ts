import { type Constituenta, type RSForm } from '@rsconcept/domain/library';
import { applyMappingToConstituents, generateAlias } from '@rsconcept/domain/library/rsform-api';

import { type CreateConstituentaBatchItem, type CreateConstituentsBatchDTO } from '../backend/types';

function toCreateItem(source: Constituenta, alias: string): CreateConstituentaBatchItem {
  return {
    cst_type: source.cst_type,
    alias,
    term_raw: source.term_raw,
    typification_manual: source.typification_manual,
    value_is_property: source.value_is_property,
    definition_formal: source.definition_formal,
    definition_raw: source.definition_raw,
    convention: source.convention,
    crucial: source.crucial,
    term_forms: source.term_forms
  };
}

/** Build batch create payload for cloning constituents in schema order. */
export function buildCloneConstituentsBatch(
  schema: RSForm,
  sourceIds: number[],
  insertAfter: number | null
): CreateConstituentsBatchDTO {
  const idSet = new Set(sourceIds);
  const sources = schema.items.filter(cst => idSet.has(cst.id));
  const mapping: Record<string, string> = {};
  const takenAliases: string[] = [];

  for (const source of sources) {
    const alias = generateAlias(source.cst_type, schema, takenAliases);
    takenAliases.push(alias);
    mapping[source.alias] = alias;
  }

  const items = sources.map(source => toCreateItem(source, mapping[source.alias]));
  applyMappingToConstituents(items, mapping, false);

  return {
    insert_after: insertAfter,
    items
  };
}
