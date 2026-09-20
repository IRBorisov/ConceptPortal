import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('self-hosted UI fonts', () => {
  it('ships every woff2 referenced by fonts.css', () => {
    const cssPath = fileURLToPath(new URL('./fonts.css', import.meta.url));
    const fontsDir = fileURLToPath(new URL('../../public/fonts/', import.meta.url));
    const css = readFileSync(cssPath, 'utf8');
    const files = [...css.matchAll(/url\('\/fonts\/([^']+)'\)/g)].map(match => match[1]);

    expect(files.length).toBeGreaterThan(0);

    for (const fileName of files) {
      expect(existsSync(join(fontsDir, fileName)), fileName).toBe(true);
    }
  });
});
