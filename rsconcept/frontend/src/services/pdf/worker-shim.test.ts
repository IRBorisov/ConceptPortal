import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { installPdfWorkerShim } from './worker-shim';

describe('pdf worker-shim', () => {
  const root = globalThis as Record<string, unknown>;
  let hadDocument: boolean;
  let originalDocument: unknown;

  beforeEach(() => {
    hadDocument = 'document' in root;
    originalDocument = root.document;
  });

  afterEach(() => {
    if (hadDocument) {
      root.document = originalDocument;
    } else {
      delete root.document;
    }
  });

  it('installs document stubs when document is missing', () => {
    const root = globalThis as Record<string, unknown>;
    delete root.document;
    delete root.window;

    installPdfWorkerShim();

    expect(root.document).toBeTruthy();
    const doc = root.document as {
      createElement: () => { querySelector: () => null; getContext?: () => unknown };
      querySelector: (selector: string) => null;
      querySelectorAll: (selector: string) => unknown[];
      createTextNode: (text: string) => unknown;
      addEventListener: (...args: unknown[]) => void;
    };
    expect(typeof doc.createElement).toBe('function');
    // Vite HMR client gates on `"document" in globalThis` then calls these.
    expect(doc.querySelector('meta')).toBeNull();
    expect(doc.querySelectorAll('link')).toEqual([]);
    expect(typeof doc.createTextNode).toBe('function');
    expect(typeof doc.addEventListener).toBe('function');
    expect(typeof doc.createElement().querySelector).toBe('function');
    expect(root.window).toBe(root);

    // Idempotent when document already exists.
    const first = root.document;
    installPdfWorkerShim();
    expect(root.document).toBe(first);
  });
});
