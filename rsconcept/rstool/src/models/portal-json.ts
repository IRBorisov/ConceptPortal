import { type BasicBinding, type RSToolValue } from './common';
import { type ConstituentaDraft } from './constituenta';

/** Portal JSON import/export format version (schema and model files). */
export const PORTAL_JSON_CONTRACT_VERSION = '1.0.0';

/** Shared metadata block in Portal schema and model JSON files. */
export interface PortalImportMetadata {
  contract_version: string;
  title: string;
  alias: string;
  description: string;
}

/** Inflected or tagged surface form of a term. */
export interface PortalTermForm {
  text: string;
  tags: string;
}

/** One constituent in Portal schema JSON (`cst_type`, snake_case fields). */
export interface PortalSchemaConstituenta {
  id: number;
  alias: string;
  convention: string;
  crucial: boolean;
  cst_type: string;
  definition_formal: string;
  typification_manual: string;
  value_is_property: boolean;
  definition_raw: string;
  definition_resolved: string;
  term_raw: string;
  term_resolved: string;
  term_forms: PortalTermForm[];
}

/** Full Portal conceptual schema import/export document. */
export interface PortalSchemaImportData extends PortalImportMetadata {
  items: PortalSchemaConstituenta[];
  attribution: Array<{ container: number; attribute: number }>;
}

/** `GET /api/rsforms/:id/details` response (schema payload only). */
export interface PortalRsformDetails {
  id?: number;
  title?: string;
  alias?: string;
  description?: string;
  items: Array<{
    id: number;
    alias: string;
    cst_type: string;
    definition_formal?: string;
    term_raw?: string;
    definition_raw?: string;
    convention?: string;
  }>;
}

/** Full Portal conceptual model import/export document. */
export interface PortalModelImportData extends PortalImportMetadata {
  items: Array<{
    id: number;
    type: string;
    value: RSToolValue | BasicBinding;
  }>;
}

/** Map a Portal API or JSON schema item to an agent {@link ConstituentaDraft}. */
export function portalItemToDraft(item: {
  id: number;
  alias: string;
  cst_type: string;
  definition_formal?: string;
  term_raw?: string;
  definition_raw?: string;
  convention?: string;
}): ConstituentaDraft {
  return {
    id: item.id,
    alias: item.alias,
    cstType: item.cst_type as ConstituentaDraft['cstType'],
    definitionFormal: item.definition_formal ?? '',
    term: item.term_raw ?? '',
    definitionText: item.definition_raw ?? '',
    convention: item.convention ?? ''
  };
}
