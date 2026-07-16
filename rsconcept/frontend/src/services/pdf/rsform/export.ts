import { type Constituenta, type RSForm } from '@rsconcept/domain/library';

import { usePreferencesStore } from '@/stores/preferences';

import { type SchemaPdfInput } from './protocol';
import { renderCstListPdfInWorker, renderSchemaPdfInWorker } from './worker-client';

/** Picks serializable fields from a live `RSForm` for worker-safe PDF rendering. */
function toSchemaPdfInput(data: RSForm): SchemaPdfInput {
  return {
    id: data.id,
    title: data.title,
    alias: data.alias,
    items: data.items
  };
}

/**
 * Builds a PDF listing the given constituents (table + page numbers).
 *
 * Uses the current UI locale from preferences. Prefer lazy-loading this module — `@react-pdf` is
 * large; generation runs in a web worker when available.
 *
 * @param data - Rows to export (typically `schema.items` or a filtered subset)
 * @returns PDF blob (`application/pdf`)
 */
export function cstListToFile(data: Constituenta[]): Promise<Blob> {
  const locale = usePreferencesStore.getState().locale;
  return renderCstListPdfInWorker(data, locale);
}

/**
 * Builds a PDF for a conceptual schema (title, source link, constituenta table, footer).
 *
 * Strips non-serializable `RSForm` fields before posting to the worker. Uses the current UI locale
 * from preferences. Prefer lazy-loading this module.
 *
 * @param data - Full schema from the app store / query cache
 * @returns PDF blob (`application/pdf`)
 */
export function createSchemaFile(data: RSForm): Promise<Blob> {
  const locale = usePreferencesStore.getState().locale;
  return renderSchemaPdfInWorker(toSchemaPdfInput(data), locale);
}
