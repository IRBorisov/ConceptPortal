import { TOUR_ANCHOR_ATTR } from '../models/tour';

export const DEFAULT_ANCHOR_TIMEOUT_MS = 5000;

/** Finds DOM elements marked with the given `data-tour` anchor value. */
export function findAnchorElements(anchor: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>(`[${TOUR_ANCHOR_ATTR}="${anchor}"]`);
}

/** True when the element is connected, laid out, and not hidden. */
export function isAnchorVisible(element: HTMLElement): boolean {
  if (!element.isConnected) {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Returns the anchor element only when it is visible and ready to spotlight. */
export function findVisibleAnchorElement(anchor: string): HTMLElement | null {
  for (const element of findAnchorElements(anchor)) {
    if (isAnchorVisible(element)) {
      return element;
    }
  }
  return null;
}

/**
 * Waits for a visible anchor using rAF polling and a DOM mutation observer.
 * Resolves `null` after `timeoutMs`, or immediately when `signal` is aborted.
 */
export function waitForAnchorElement(
  anchor: string,
  timeoutMs = DEFAULT_ANCHOR_TIMEOUT_MS,
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
    let observer: MutationObserver | null = null;

    function cleanup() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      observer?.disconnect();
      observer = null;
      signal?.removeEventListener('abort', onAbort);
    }

    function finish(result: HTMLElement | null) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(result);
    }

    function onAbort() {
      finish(null);
    }

    function tryResolve() {
      if (signal?.aborted) {
        finish(null);
        return;
      }
      const element = findVisibleAnchorElement(anchor);
      if (element) {
        finish(element);
        return;
      }
      if (performance.now() > deadline) {
        finish(null);
      }
    }

    function poll() {
      tryResolve();
      if (!settled) {
        frame = requestAnimationFrame(poll);
      }
    }

    signal?.addEventListener('abort', onAbort, { once: true });

    observer = new MutationObserver(function onDomChange() {
      tryResolve();
    });
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', TOUR_ANCHOR_ATTR]
      });
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
