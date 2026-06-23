import { fileURLToPath } from 'node:url';

function publicFontPath(fileName: string): string {
  return fileURLToPath(new URL(`../../../public/fonts/${fileName}`, import.meta.url));
}

/** Font URL for @react-pdf: web path in app, filesystem path under Vitest. */
export function pdfFontSrc(fileName: string): string {
  if (import.meta.env.MODE === 'test') {
    return publicFontPath(fileName);
  }
  return `/fonts/${fileName}`;
}
