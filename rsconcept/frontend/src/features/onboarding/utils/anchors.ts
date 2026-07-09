import { TOUR_ANCHOR_ATTR } from '../models/tour';

/** Finds the DOM element marked with the given `data-tour` anchor value. */
export function findAnchorElement(anchor: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${TOUR_ANCHOR_ATTR}="${anchor}"]`);
}

/**
 * Waits for the anchor element to appear using rAF polling.
 * Resolves `null` after `timeoutMs`, or immediately when `signal` is aborted,
 * so a missing or abandoned anchor never blocks the tour (caller should skip the step).
 */
export function waitForAnchorElement(
  anchor: string,
  timeoutMs = 3000,
  signal?: AbortSignal
): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    if (signal?.aborted) {
      resolve(null);
      return;
    }

    const deadline = performance.now() + timeoutMs;
    let frame = 0;
    let settled = false;

    function finish(result: HTMLElement | null) {
      if (settled) {
        return;
      }
      settled = true;
      if (frame) {
        cancelAnimationFrame(frame);
      }
      signal?.removeEventListener('abort', onAbort);
      resolve(result);
    }

    function onAbort() {
      finish(null);
    }

    function poll() {
      if (signal?.aborted) {
        finish(null);
        return;
      }
      const element = findAnchorElement(anchor);
      if (element) {
        finish(element);
        return;
      }
      if (performance.now() > deadline) {
        finish(null);
        return;
      }
      frame = requestAnimationFrame(poll);
    }

    signal?.addEventListener('abort', onAbort, { once: true });
    poll();
  });
}

/** Compares rects with a small tolerance to avoid re-render churn while tracking. */
export function rectsAlmostEqual(a: DOMRect | null, b: DOMRect | null, tolerance = 0.5): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return (
    Math.abs(a.top - b.top) < tolerance &&
    Math.abs(a.left - b.left) < tolerance &&
    Math.abs(a.width - b.width) < tolerance &&
    Math.abs(a.height - b.height) < tolerance
  );
}
