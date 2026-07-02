const EDGE_THRESHOLD_PX = 48;
const MAX_SCROLL_STEP_PX = 18;

/** Finds the nearest scrollable ancestor of an element. */
export function resolveScrollContainer(element: HTMLElement | null): HTMLElement | null {
  let current = element;
  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/** Temporarily disables CSS scroll-snap on a container and its table rows during drag. */
export function disableScrollSnap(container: HTMLElement): void {
  container.style.scrollSnapType = 'none';
  container.querySelectorAll('.cc-scroll-row').forEach(row => {
    (row as HTMLElement).style.scrollSnapStop = 'normal';
  });
}

/** Restores CSS scroll-snap after row drag ends. */
export function restoreScrollSnap(container: HTMLElement): void {
  container.style.scrollSnapType = '';
  container.querySelectorAll('.cc-scroll-row').forEach(row => {
    (row as HTMLElement).style.scrollSnapStop = '';
  });
}

/** Vertical scroll direction: up (-1), none (0), or down (1). */
export type ScrollDirection = -1 | 0 | 1;

/**
 * Determines scroll direction from the pointer Y position relative to container edges.
 *
 * @param container - Scrollable element.
 * @param clientY - Pointer Y coordinate in viewport pixels.
 */
export function getScrollDirection(container: HTMLElement, clientY: number): ScrollDirection {
  const { top, bottom } = container.getBoundingClientRect();
  if (clientY < top || clientY > bottom) {
    return 0;
  }

  const distanceFromTop = clientY - top;
  const distanceFromBottom = bottom - clientY;

  if (distanceFromTop < EDGE_THRESHOLD_PX) {
    return -1;
  }
  if (distanceFromBottom < EDGE_THRESHOLD_PX) {
    return 1;
  }
  return 0;
}

/**
 * Scrolls a container when dragging near its top or bottom edge.
 *
 * @param container - Scrollable element.
 * @param clientY - Pointer Y coordinate in viewport pixels.
 * @param direction - Scroll direction from {@link getScrollDirection}.
 */
export function scrollOnDragOver(container: HTMLElement, clientY: number, direction: ScrollDirection): void {
  const { top, bottom } = container.getBoundingClientRect();
  const distanceFromTop = clientY - top;
  const distanceFromBottom = bottom - clientY;

  if (direction < 0) {
    if (container.scrollTop <= 0) {
      return;
    }
    const intensity = Math.min(1, (EDGE_THRESHOLD_PX - distanceFromTop) / EDGE_THRESHOLD_PX);
    container.scrollTop -= Math.max(1, Math.round(intensity * MAX_SCROLL_STEP_PX));
    return;
  }

  if (direction > 0) {
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
      return;
    }
    const intensity = Math.min(1, (EDGE_THRESHOLD_PX - distanceFromBottom) / EDGE_THRESHOLD_PX);
    container.scrollTop += Math.max(1, Math.round(intensity * MAX_SCROLL_STEP_PX));
  }
}

/**
 * Returns a Y coordinate inside the container edge zone for synthetic drag-over events.
 *
 * @param container - Scrollable element.
 * @param direction - Target edge direction.
 */
export function getEdgeClientY(container: HTMLElement, direction: ScrollDirection): number {
  const { top, bottom } = container.getBoundingClientRect();
  if (direction < 0) {
    return top + EDGE_THRESHOLD_PX / 2;
  }
  if (direction > 0) {
    return bottom - EDGE_THRESHOLD_PX / 2;
  }
  return top + container.clientHeight / 2;
}
