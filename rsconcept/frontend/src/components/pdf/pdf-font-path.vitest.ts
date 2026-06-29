import { fileURLToPath } from 'node:url';

/** Font URL for @react-pdf: filesystem path under Vitest. */
export function pdfFontSrc(fileName: string): string {
  return fileURLToPath(new URL(`../../../public/fonts/${fileName}`, import.meta.url));
}
