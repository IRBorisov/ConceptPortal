import { TOUR_ANCHOR_ATTR } from '../models/tour';

/** Finds the DOM element marked with the given `data-tour` anchor value. */
export function findAnchorElement(anchor: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${TOUR_ANCHOR_ATTR}="${anchor}"]`);
}

/**
 * Waits for the anchor element to appear using rAF polling.
 * Resolves `null` after `timeoutMs` so a missing anchor never blocks the tour.
 */
export function waitForAnchorElement(anchor: string, timeoutMs = 3000): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    const deadline = performance.now() + timeoutMs;

    function poll() {
      const element = findAnchorElement(anchor);
      if (element) {
        resolve(element);
        return;
      }
      if (performance.now() > deadline) {
        resolve(null);
        return;
      }
      requestAnimationFrame(poll);
    }

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
