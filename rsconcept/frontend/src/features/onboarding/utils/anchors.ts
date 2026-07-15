import { TOUR_ANCHOR_ATTR } from '../models/tour';

export const DEFAULT_ANCHOR_TIMEOUT_MS = 5000;
/** Poll interval while waiting for a visible tour anchor (avoids rAF layout thrash). */
const ANCHOR_POLL_INTERVAL_MS = 100;

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
 * Waits for a visible anchor with a throttled timeout poll.
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

    function cleanup() {
      if (frame) {
        clearTimeout(frame);
        frame = 0;
      }
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
        frame = window.setTimeout(poll, ANCHOR_POLL_INTERVAL_MS);
      }
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
