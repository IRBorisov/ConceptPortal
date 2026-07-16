/**
 * Client-side PDF export via `@react-pdf/renderer`.
 *
 * Prefer lazy `import('@/services/pdf')`: the renderer is large and generation runs in a web
 * worker when available (main-thread fallback under Vitest).
 *
 * ## Public export API
 *
 * - {@link createSchemaFile} — full schema PDF (title, constituenta table, footer)
 * - {@link cstListToFile} — constituenta-list PDF (table only)
 *
 * Pass `locale` from the UI; this package does not read preferences. Feature exporters live under
 * `rsform/` beside shared PDF chrome; the barrel stays free of `@react-pdf` on the happy path.
 *
 * ## Package layout
 *
 * - **Common** (`services/pdf/*`) — `PdfDocument`, `PdfIntlRoot`, `pdfs`, text/layout, worker shim
 * - **RSForm** (`services/pdf/rsform/*`) — DTOs, documents, formal-text, queued worker export
 */
export { createSchemaFile, cstListToFile } from './rsform';
