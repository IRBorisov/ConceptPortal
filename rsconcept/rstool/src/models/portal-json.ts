import { type BasicBinding, type RSToolValue } from './common';

/** Portal JSON import/export format version (schema and model files). */
export const PORTAL_JSON_CONTRACT_VERSION = '1.0.0';

export interface PortalImportMetadata {
  contract_version: string;
  title: string;
  alias: string;
  description: string;
}

export interface PortalTermForm {
  text: string;
  tags: string;
}

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

export interface PortalSchemaImportData extends PortalImportMetadata {
  items: PortalSchemaConstituenta[];
  attribution: Array<{ container: number; attribute: number }>;
}

export interface PortalModelImportData extends PortalImportMetadata {
  items: Array<{
    id: number;
    type: string;
    value: RSToolValue | BasicBinding;
  }>;
}
