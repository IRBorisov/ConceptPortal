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
 * ## Package layout
 *
 * - **Common** (`services/pdf/*`, import by deep path) — `PdfDocument`, `PdfIntlRoot`, `pdfs`,
 *   text/layout helpers, `worker-shim`, fonts
 * - **RSForm** (`services/pdf/rsform/*`) — schema / list documents, formal-text spacing, worker
 *
 * This barrel intentionally re-exports only the two export entry points so a dynamic import does
 * not pull `@react-pdf` onto the main thread; use deep imports for shared building blocks.
 */
export { createSchemaFile, cstListToFile } from './rsform';
