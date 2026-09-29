import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('self-hosted UI fonts', () => {
  it('ships Noto Color Emoji as one COLRv1 face', () => {
    const cssPath = fileURLToPath(new URL('./fonts.css', import.meta.url));
    const css = readFileSync(cssPath, 'utf8');

    expect(css).toContain("url('/fonts/noto-color-emoji.woff2') format('woff2') tech(color-COLRv1)");
    expect(css).toContain('font-display: swap;');
    expect(css).toMatch(/noto-color-emoji\.woff2'\) format\('woff2'\) tech\(color-COLRv1\);\s*unicode-range: /);
    expect(css).not.toContain('noto-color-emoji-0-');
  });

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

  it('ships SIL OFL license text for each UI family', () => {
    const fontsDir = fileURLToPath(new URL('../../public/fonts/', import.meta.url));
    const families = [
      'rubik',
      'fira-code',
      'alegreya-sans-sc',
      'noto-sans-math',
      'noto-sans-symbols-2',
      'noto-color-emoji'
    ];

    for (const family of families) {
      const licensePath = join(fontsDir, 'licenses', `${family}.txt`);
      expect(existsSync(licensePath), family).toBe(true);
      expect(readFileSync(licensePath, 'utf8')).toContain('SIL Open Font License');
    }
  });
});
