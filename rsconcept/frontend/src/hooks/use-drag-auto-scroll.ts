'use client';

import { type RefObject, useEffect, useRef } from 'react';

import {
  disableScrollSnap,
  getEdgeClientY,
  getScrollDirection,
  resolveScrollContainer,
  restoreScrollSnap,
  type ScrollDirection,
  scrollOnDragOver
} from '@/components/data-table/drag-auto-scroll';

/** Auto-scroll the nearest overflow container while HTML5 row drag is active. */
export function useDragAutoScroll(containerRef: RefObject<HTMLElement | null>, isDragging: boolean): void {
  const clientYRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const scrollDirectionRef = useRef<ScrollDirection>(0);

  useEffect(
    function trackDragPointerY() {
      if (!isDragging) {
        clientYRef.current = null;
        scrollDirectionRef.current = 0;
        const container = scrollContainerRef.current;
        if (container) {
          restoreScrollSnap(container);
        }
        scrollContainerRef.current = null;
        return;
      }

      const container = resolveScrollContainer(containerRef.current);
      scrollContainerRef.current = container;
      if (container) {
        disableScrollSnap(container);
      }

      function handleDragOver(event: DragEvent) {
        event.preventDefault();
        clientYRef.current = event.clientY;
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          scrollDirectionRef.current = getScrollDirection(scrollContainer, event.clientY);
        }
      }

      document.addEventListener('dragover', handleDragOver, { capture: true });
      return function removeDragPointerTracker() {
        document.removeEventListener('dragover', handleDragOver, { capture: true });
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          restoreScrollSnap(scrollContainer);
        }
      };
    },
    [containerRef, isDragging]
  );

  useEffect(
    function autoScrollWhileDragging() {
      if (!isDragging) {
        return;
      }

      let frameID = 0;
      function tick() {
        const container = scrollContainerRef.current;
        const direction = scrollDirectionRef.current;
        if (container && direction !== 0) {
          const clientY = clientYRef.current ?? getEdgeClientY(container, direction);
          scrollOnDragOver(container, clientY, direction);
        }
        frameID = requestAnimationFrame(tick);
      }

      frameID = requestAnimationFrame(tick);
      return function cancelAutoScroll() {
        cancelAnimationFrame(frameID);
      };
    },
    [isDragging]
  );
}
