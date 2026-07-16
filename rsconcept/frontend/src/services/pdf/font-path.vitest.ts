import { fileURLToPath } from 'node:url';

/**
 * Vitest stand-in for {@link ./font-path}: returns an absolute filesystem path under
 * `public/fonts/` so `@react-pdf` can load TTFs without an HTTP server.
 *
 * Wired via the `font-path` → `font-path.vitest` alias in `vitest.config.ts`.
 */
export function pdfFontSrc(fileName: string): string {
  return fileURLToPath(new URL(`../../../public/fonts/${fileName}`, import.meta.url));
}
