const EDGE_THRESHOLD_PX = 48;
const MAX_SCROLL_STEP_PX = 18;

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

export function disableScrollSnap(container: HTMLElement): void {
  container.style.scrollSnapType = 'none';
  container.querySelectorAll('.cc-scroll-row').forEach(row => {
    (row as HTMLElement).style.scrollSnapStop = 'normal';
  });
}

export function restoreScrollSnap(container: HTMLElement): void {
  container.style.scrollSnapType = '';
  container.querySelectorAll('.cc-scroll-row').forEach(row => {
    (row as HTMLElement).style.scrollSnapStop = '';
  });
}

export type ScrollDirection = -1 | 0 | 1;

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
