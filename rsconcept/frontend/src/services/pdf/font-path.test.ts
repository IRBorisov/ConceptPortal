import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { pdfFontSrc } from './font-path.vitest';

describe('pdfFontSrc', () => {
  it('resolves bundled fonts from the public directory in test mode', () => {
    const fontPath = pdfFontSrc('ConceptText-Regular.ttf');

    expect(fontPath).not.toMatch(/^\/fonts\//);
    expect(existsSync(fontPath)).toBe(true);
  });
});
