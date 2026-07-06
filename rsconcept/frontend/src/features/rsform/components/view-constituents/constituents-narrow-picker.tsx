'use client';

import { type ReactNode, type RefObject, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { type Constituenta, type RSEngine, type RSForm } from '@rsconcept/domain/library';

import { cn } from '@/components/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAppLayoutStore } from '@/stores/app-layout';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ConstituentsNarrowPickerProps {
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;
  isSchemaIssue?: (cst: Constituenta) => boolean;
  isModelIssue?: (cst: Constituenta) => boolean;
  onActivate?: (cst: Constituenta) => void;
  showModelFilter?: boolean;
  stopSearchKeyPropagation?: boolean;
  className?: string;
  searchClassName?: string;
  children?: ReactNode;
}

/**
 * Search bar + dropdown constituents list for narrow (below `lg`) layouts.
 *
 * Renders the positioning container itself: place the underlying editor form as {@link children}.
 * The overlay opens when the search bar receives focus and covers the container width.
 */
export function ConstituentsNarrowPicker({
  schema,
  engine,
  activeCst,
  isSchemaIssue,
  isModelIssue,
  onActivate,
  showModelFilter,
  stopSearchKeyPropagation,
  className,
  searchClassName,
  children
}: ConstituentsNarrowPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        ref={anchorRef}
        className={cn('relative shrink-0 lg:hidden', searchClassName)}
        onFocusCapture={() => setOpen(true)}
      >
        <ConstituentsSearch
          id='constituents_search_narrow'
          compact
          showModelFilter={showModelFilter}
          stopSearchKeyPropagation={stopSearchKeyPropagation}
        />
      </div>
      {children}
      <NarrowPickerOverlay
        className='lg:hidden'
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchorRef}
        containerRef={containerRef}
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        isSchemaIssue={isSchemaIssue}
        isModelIssue={isModelIssue}
        onActivate={onActivate}
      />
    </div>
  );
}

const LIST_MIN_HEIGHT = '10rem';
const ANCHOR_GAP_PX = 4;

/** Detects an open (not animating out) select dropdown, e.g. the constituents filter. */
function hasOpenSelectPopup(): boolean {
  return document.querySelector('[data-slot="select-content"]:not([data-closed])') !== null;
}

function fitHeightFromViewportOffset(
  offset: string,
  minimum: string,
  noNavigation: boolean,
  noFooter: boolean
): string {
  if (noNavigation) {
    return `max(calc(100dvh - (${offset})), ${minimum})`;
  }
  if (noFooter) {
    return `max(calc(100dvh - 3rem - (${offset})), ${minimum})`;
  }
  return `max(calc(100dvh - 6.75rem - (${offset})), ${minimum})`;
}

interface NarrowPickerOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;
  isSchemaIssue?: (cst: Constituenta) => boolean;
  isModelIssue?: (cst: Constituenta) => boolean;
  onActivate?: (cst: Constituenta) => void;
  className?: string;
}

function NarrowPickerOverlay({
  open,
  onOpenChange,
  anchorRef,
  containerRef,
  schema,
  engine,
  activeCst,
  isSchemaIssue,
  isModelIssue,
  onActivate,
  className
}: NarrowPickerOverlayProps) {
  const { isLg } = useWindowSize();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  const [overlayTop, setOverlayTop] = useState(0);
  const [overlayLeft, setOverlayLeft] = useState(0);
  const [overlayWidth, setOverlayWidth] = useState(0);
  const [listMaxHeight, setListMaxHeight] = useState(LIST_MIN_HEIGHT);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const updateOverlayGeometry = useEffectEvent(function updateOverlayGeometryPosition() {
    const container = containerRef.current;
    const anchor = anchorRef.current;
    if (!container || !anchor) {
      setOverlayTop(0);
      setOverlayLeft(0);
      setOverlayWidth(0);
      setListMaxHeight(LIST_MIN_HEIGHT);
      return;
    }

    const { noNavigation: navHidden, noFooter: footerHidden } = useAppLayoutStore.getState();
    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const listTop = anchorRect.bottom + ANCHOR_GAP_PX;

    setOverlayTop(listTop);
    setOverlayLeft(containerRect.left);
    setOverlayWidth(containerRect.width);
    setListMaxHeight(fitHeightFromViewportOffset(`${listTop}px`, LIST_MIN_HEIGHT, navHidden, footerHidden));
  });

  function handleActivate(cst: Constituenta) {
    previousFocusRef.current = null;
    onActivate?.(cst);
    onOpenChange(false);
  }

  useLayoutEffect(
    function syncOverlayGeometryWhileOpen() {
      if (!open) {
        return;
      }
      updateOverlayGeometry();
      window.addEventListener('resize', updateOverlayGeometry);
      document.addEventListener('scroll', updateOverlayGeometry, true);
      return () => {
        window.removeEventListener('resize', updateOverlayGeometry);
        document.removeEventListener('scroll', updateOverlayGeometry, true);
      };
    },
    [containerRef, noFooter, noNavigation, open]
  );

  useLayoutEffect(
    function markUnderlyingContentInertWhileOpen() {
      const container = containerRef.current;
      if (!open || !container || isLg) {
        return;
      }

      const anchor = anchorRef.current;
      const inertElements: HTMLElement[] = [];
      for (const child of container.children) {
        const element = child as HTMLElement;
        if (element === anchor) {
          continue;
        }
        element.setAttribute('inert', '');
        inertElements.push(element);
      }

      return function clearUnderlyingInert() {
        for (const element of inertElements) {
          element.removeAttribute('inert');
        }
      };
    },
    [anchorRef, containerRef, isLg, open]
  );

  useEffect(
    function closeOverlayOnDesktopLayout() {
      if (open && isLg) {
        onOpenChange(false);
      }
    },
    [isLg, onOpenChange, open]
  );

  useEffect(
    function manageOverlayFocus() {
      if (!open || isLg) {
        return;
      }

      const anchor = anchorRef.current;
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(function focusOverlayPanel() {
        // Keep focus in the search bar when it triggered the opening.
        const active = document.activeElement;
        if (active && anchor?.contains(active)) {
          return;
        }
        panelRef.current?.focus();
      });

      return function restoreFocusOnClose() {
        cancelAnimationFrame(frame);
        const target = previousFocusRef.current;
        if (!target || anchor?.contains(target)) {
          return;
        }
        target.focus();
      };
    },
    [anchorRef, isLg, open]
  );

  useEffect(
    function closeOnClickOutside() {
      if (!open) {
        return;
      }

      function handlePointerDown(event: PointerEvent) {
        const target = event.target;
        if (!(target instanceof Node)) {
          return;
        }
        if (anchorRef.current?.contains(target)) {
          return;
        }
        if (overlayRef.current?.contains(target)) {
          return;
        }
        if (target instanceof Element && target.closest('[data-slot="select-content"]')) {
          return;
        }
        // Dismissing an open dropdown (e.g. the filter select) should not close the picker.
        if (hasOpenSelectPopup()) {
          return;
        }
        onOpenChange(false);
      }

      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown, true);
      };
    },
    [anchorRef, onOpenChange, open]
  );

  useEffect(
    function closeOnEscape() {
      if (!open) {
        return;
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape' && !hasOpenSelectPopup()) {
          event.preventDefault();
          event.stopPropagation();
          onOpenChange(false);
        }
      }

      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    },
    [onOpenChange, open]
  );

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !overlayRef.current) {
      return;
    }

    const focusable = Array.from(
      overlayRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    const active = document.activeElement;

    if (focusable.length === 0) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (active === first || active === panelRef.current) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      className={cn('fixed z-pop flex min-h-0 flex-col px-6', className)}
      style={{ top: overlayTop, left: overlayLeft, width: overlayWidth, height: listMaxHeight }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border bg-background shadow-lg outline-hidden'
        onKeyDown={handlePanelKeyDown}
      >
        <TableSideConstituents
          className='min-h-0 min-w-0 flex-1'
          schema={schema}
          engine={engine}
          activeCst={activeCst}
          isSchemaIssue={isSchemaIssue}
          isModelIssue={isModelIssue}
          onActivate={onActivate ? handleActivate : undefined}
          maxHeight='100%'
          autoScroll
        />
      </div>
    </div>,
    document.body
  );
}
