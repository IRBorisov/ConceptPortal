import { afterEach, describe, expect, it } from 'vitest';

import { installPdfWorkerShim } from './worker-shim';

describe('pdf worker-shim', () => {
  afterEach(() => {
    // Restore a real-enough document so other tests are unaffected.
    const root = globalThis as Record<string, unknown>;
    if (!root.document || typeof (root.document as { createElement?: unknown }).createElement !== 'function') {
      root.document = {
        createElement: () => ({ style: {} })
      };
    }
  });

  it('installs document stubs when document is missing', () => {
    const root = globalThis as Record<string, unknown>;
    delete root.document;
    delete root.window;

    installPdfWorkerShim();

    expect(root.document).toBeTruthy();
    expect(typeof (root.document as { createElement: unknown }).createElement).toBe('function');
    expect(root.window).toBe(root);

    // Idempotent when document already exists.
    const first = root.document;
    installPdfWorkerShim();
    expect(root.document).toBe(first);
  });
});
