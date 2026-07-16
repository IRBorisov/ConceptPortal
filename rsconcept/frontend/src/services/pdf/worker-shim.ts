/**
 * Side-effect module: installs minimal `document` / `window` stubs on `globalThis`.
 *
 * `@react-pdf/renderer` (Yoga / fontkit) touches DOM globals during module evaluation. Dedicated
 * workers have neither, so the worker entry must import this file **first** (before any
 * `@react-pdf` or PDF document module) so evaluation order installs the stubs in time.
 *
 * In Vite dev, `@vite/client` may also load in the worker and gates on `"document" in globalThis`,
 * then calls `querySelector` / `querySelectorAll` — stubs must include those or the worker crashes.
 *
 * Idempotent: safe if `document` already exists (browser main thread). Stubs are intentionally
 * minimal (`measureText` → width `0`); keep a smoke test and re-check after `@react-pdf` upgrades.
 */

export function installPdfWorkerShim(): void {
  const root = globalThis as Record<string, unknown>;

  if (root.document) {
    return;
  }

  const noop = (..._args: unknown[]) => undefined;

  function createElement() {
    const element: Record<string, unknown> = {
      style: {},
      childNodes: [],
      children: [],
      ownerDocument: null,
      parentNode: null,
      setAttribute: noop,
      getAttribute: () => null,
      removeAttribute: noop,
      appendChild: () => element,
      removeChild: () => element,
      insertBefore: () => element,
      addEventListener: noop,
      removeEventListener: noop,
      querySelector: () => null,
      querySelectorAll: () => [],
      getContext: () => ({
        canvas: element,
        fillRect: noop,
        clearRect: noop,
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: noop,
        createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        setTransform: noop,
        drawImage: noop,
        save: noop,
        fillText: noop,
        restore: noop,
        beginPath: noop,
        moveTo: noop,
        lineTo: noop,
        closePath: noop,
        stroke: noop,
        translate: noop,
        scale: noop,
        rotate: noop,
        arc: noop,
        fill: noop,
        measureText: () => ({ width: 0 }),
        transform: noop,
        rect: noop,
        clip: noop
      })
    };
    return element;
  }

  root.document = {
    createElement,
    createElementNS: createElement,
    createTextNode: (text: string) => ({ nodeValue: text, textContent: text }),
    getElementsByTagName: () => [createElement()],
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    documentElement: createElement(),
    body: createElement(),
    head: createElement(),
    visibilityState: 'visible'
  };
  root.window = root;
}

installPdfWorkerShim();
