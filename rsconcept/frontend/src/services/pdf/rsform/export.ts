import { type AppLocale } from '@/i18n';
import { type Constituenta, type RSForm } from '@rsconcept/domain/library';

import { toConstituentaPdfRow, toSchemaPdfInput } from './protocol';
import { renderCstListPdfInWorker, renderSchemaPdfInWorker } from './worker-client';

/**
 * Builds a PDF listing the given constituents (table + page numbers).
 *
 * Prefer lazy-loading this module — `@react-pdf` is large; generation runs in a web worker when
 * available.
 *
 * @param data - Rows to export (typically `schema.items` or a filtered subset)
 * @param locale - Active UI locale
 * @returns PDF blob (`application/pdf`)
 */
export function cstListToFile(data: Constituenta[], locale: AppLocale): Promise<Blob> {
  return renderCstListPdfInWorker(data.map(toConstituentaPdfRow), locale);
}

/**
 * Builds a PDF for a conceptual schema (title, source link, constituenta table, footer).
 *
 * Trims the schema to a minimal DTO before posting to the worker. Prefer lazy-loading this module.
 *
 * @param data - Full schema from the app store / query cache
 * @param locale - Active UI locale
 * @returns PDF blob (`application/pdf`)
 */
export function createSchemaFile(data: RSForm, locale: AppLocale): Promise<Blob> {
  return renderSchemaPdfInWorker(toSchemaPdfInput(data), locale);
}
