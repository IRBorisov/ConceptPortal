import { type PortalModelImportData, type PortalSchemaImportData } from './portal-json';

/** Portal export target: conceptual schema or model values. */
export type PortalExportKind = 'schema' | 'model';

/** Serialized JSON string or parsed object for export helpers. */
export type ExportFormat = 'json' | 'object';

/** Input for {@link RSToolAgent.exportPortal}. */
export interface ExportPortalInput {
  kind: PortalExportKind;
  /** Default: `json` (string). Use `object` for structured data. */
  format?: ExportFormat;
}

/**
 * Import payload discriminator.
 *
 * Use `'auto'` to detect from JSON shape, or pass an explicit kind when ambiguous.
 */
export type ImportDataKind = 'auto' | 'session' | 'portal-schema' | 'portal-details';

/** JSON string or Portal import object, depending on {@link ExportFormat}. */
export type ExportPortalResult = string | PortalSchemaImportData | PortalModelImportData;
