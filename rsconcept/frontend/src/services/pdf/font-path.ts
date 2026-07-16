/**
 * Resolves a font file under `public/fonts/` for `@react-pdf` `Font.register`.
 *
 * In the browser (and PDF web workers) returns an absolute URL using `location.origin` when
 * available, otherwise a root-relative `/fonts/...` path. Vitest redirects this module to
 * {@link ./font-path.vitest} so fonts load from the filesystem.
 *
 * @param fileName - File name only (e.g. `ConceptText-Regular.ttf`), not a path
 */
export function pdfFontSrc(fileName: string): string {
  const origin =
    typeof globalThis !== 'undefined' &&
    'location' in globalThis &&
    typeof (globalThis as { location?: { origin?: string } }).location?.origin === 'string'
      ? (globalThis as { location: { origin: string } }).location.origin
      : '';
  return origin ? `${origin}/fonts/${fileName}` : `/fonts/${fileName}`;
}
