import { useEffect, useLayoutEffect, useRef } from 'react';

import { disableScrollSnap, resolveScrollContainer, restoreScrollSnap } from '@/components/data-table/drag-auto-scroll';
import { PARAMETER } from '@/utils/constants';

export interface ScrollToConstituentOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

const SMOOTH_SCROLL_RESTORE_MS = 400;

function computeCenteredScrollTop(container: HTMLElement, row: HTMLElement): number {
  const containerRect = container.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  const rowTop = rowRect.top - containerRect.top + container.scrollTop;

  return Math.max(
    0,
    Math.min(rowTop - (container.clientHeight - rowRect.height) / 2, container.scrollHeight - container.clientHeight)
  );
}

function restoreScrollSnapAfter(container: HTMLElement, behavior: ScrollBehavior): void {
  if (behavior !== 'smooth') {
    restoreScrollSnap(container);
    return;
  }
  window.setTimeout(function restoreAfterSmoothScroll() {
    restoreScrollSnap(container);
  }, SMOOTH_SCROLL_RESTORE_MS);
}

/** Scrolls a constituent badge (or its table row) into view. Returns false when the target is not in the DOM yet. */
export function scrollToConstituentElement(
  prefix: string,
  cstId: number,
  options?: ScrollToConstituentOptions
): boolean {
  const element = document.getElementById(`${prefix}${cstId}`);
  if (!element) {
    return false;
  }

  const behavior = options?.behavior ?? 'smooth';
  const block = options?.block ?? 'center';
  const inline = options?.inline ?? 'end';
  const row = element.closest('tr');
  const scrollTarget = (row as HTMLElement | null) ?? element;
  const container = resolveScrollContainer(element);

  if (!container || block !== 'center') {
    scrollTarget.scrollIntoView({ behavior, block, inline });
    return true;
  }

  disableScrollSnap(container);
  container.scrollTo({ top: computeCenteredScrollTop(container, scrollTarget), behavior });
  restoreScrollSnapAfter(container, behavior);
  return true;
}

function scheduleScrollToConstituent(prefix: string, cstId: number, options?: ScrollToConstituentOptions): void {
  function tryScroll(): boolean {
    return scrollToConstituentElement(prefix, cstId, options);
  }

  if (tryScroll()) {
    return;
  }

  requestAnimationFrame(function retryOnNextFrame() {
    if (tryScroll()) {
      return;
    }
    window.setTimeout(tryScroll, PARAMETER.refreshTimeout);
  });
}

export function useScrollToConstituent(
  prefix: string,
  cstId: number | undefined | null,
  enabled = true,
  options?: ScrollToConstituentOptions
): void {
  const prevCstId = useRef<number | null>(null);
  const isFirstRender = useRef(true);
  const behavior = options?.behavior;
  const block = options?.block;
  const inline = options?.inline;

  useLayoutEffect(
    function scrollInstantlyOnMount() {
      if (!enabled || cstId == null || !isFirstRender.current) {
        return;
      }
      isFirstRender.current = false;
      prevCstId.current = cstId;
      const targetCstId = cstId;

      let cancelled = false;
      function tryScroll(): boolean {
        if (cancelled) {
          return true;
        }
        return scrollToConstituentElement(prefix, targetCstId, { behavior: 'instant', block, inline });
      }

      if (!tryScroll()) {
        requestAnimationFrame(function retryOnNextFrame() {
          if (!tryScroll()) {
            window.setTimeout(tryScroll, PARAMETER.refreshTimeout);
          }
        });
      }

      return function cancelPendingScroll() {
        cancelled = true;
      };
    },
    [prefix, cstId, enabled, block, inline]
  );

  useEffect(
    function scrollSmoothlyOnActiveChange() {
      if (!enabled || cstId == null || prevCstId.current === cstId) {
        return;
      }
      prevCstId.current = cstId;
      scheduleScrollToConstituent(prefix, cstId, { behavior: behavior ?? 'smooth', block, inline });
    },
    [prefix, cstId, enabled, behavior, block, inline]
  );
}
