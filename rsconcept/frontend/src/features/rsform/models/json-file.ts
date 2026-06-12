import { globalTx } from '@/i18n';
import { type CstType } from '@rsconcept/domain/library';
import { validateAliasFormat } from '@rsconcept/domain/library/rsform-api';

import { PORTAL_JSON_CONTRACT_VERSION } from '@/features/library/models/portal-import-json';

import { type ConstituentaBasicsDTO, type RSFormImportJsonDTO } from '../backend/types';

interface RSFormImportContent {
  title: string;
  alias: string;
  description: string;
  items: readonly ConstituentaBasicsDTO[];
  attribution: readonly { container: number; attribute: number }[];
}

/** Build Portal schema JSON import payload from schema content. */
export function rsFormContentToImportJson(content: RSFormImportContent): RSFormImportJsonDTO {
  return {
    contract_version: PORTAL_JSON_CONTRACT_VERSION,
    title: content.title,
    alias: content.alias,
    description: content.description,
    items: content.items.map(cst => ({
      id: cst.id,
      alias: cst.alias,
      convention: cst.convention,
      crucial: cst.crucial,
      cst_type: cst.cst_type,
      definition_formal: cst.definition_formal,
      typification_manual: cst.typification_manual,
      value_is_property: cst.value_is_property,
      definition_raw: cst.definition_raw,
      definition_resolved: cst.definition_resolved,
      term_raw: cst.term_raw,
      term_resolved: cst.term_resolved,
      term_forms: cst.term_forms
    })),
    attribution: content.attribution.map(({ container, attribute }) => ({ container, attribute }))
  };
}

interface ImportConstituenta {
  alias: string;
  cst_type: CstType;
}

/** Return a user-facing error when imported constituents have invalid or duplicate aliases. */
export function validateImportedAliases(items: readonly ImportConstituenta[]): string | null {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.alias)) {
      return globalTx('tx.cst.alias.validate.import.duplicate', { alias: item.alias });
    }
    seen.add(item.alias);
    if (!validateAliasFormat(item.alias, item.cst_type)) {
      return globalTx('tx.cst.alias.validate.import.format', { alias: item.alias });
    }
  }
  return null;
}
