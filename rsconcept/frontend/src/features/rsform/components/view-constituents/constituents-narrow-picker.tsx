'use client';

import { forwardRef, type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { type Constituenta, type RSEngine, type RSForm } from '@rsconcept/domain/library';

import { cn } from '@/components/utils';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

interface ConstituentsNarrowSearchProps {
  onOpen?: () => void;
  showModelFilter?: boolean;
  stopSearchKeyPropagation?: boolean;
  className?: string;
}

export const ConstituentsNarrowSearch = forwardRef<HTMLDivElement, ConstituentsNarrowSearchProps>(
  function ConstituentsNarrowSearch({ onOpen, showModelFilter, stopSearchKeyPropagation, className }, ref) {
    function handleFocusCapture() {
      onOpen?.();
    }

    return (
      <div ref={ref} className={cn('relative shrink-0', className)} onFocusCapture={handleFocusCapture}>
        <ConstituentsSearch
          compact
          showModelFilter={showModelFilter}
          stopSearchKeyPropagation={stopSearchKeyPropagation}
        />
      </div>
    );
  }
);

interface ConstituentsNarrowPickerProps {
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

export function ConstituentsNarrowPicker({
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
}: ConstituentsNarrowPickerProps) {
  const [overlayTop, setOverlayTop] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const updateOverlayTop = useCallback(
    function updateOverlayTopPosition() {
      if (!containerRef.current || !anchorRef.current) {
        setOverlayTop(0);
        return;
      }
      const contentRect = containerRef.current.getBoundingClientRect();
      const anchorRect = anchorRef.current.getBoundingClientRect();
      setOverlayTop(anchorRect.bottom - contentRect.top + 4);
    },
    [anchorRef, containerRef]
  );

  function handleActivate(cst: Constituenta) {
    onActivate?.(cst);
    onOpenChange(false);
  }

  useLayoutEffect(
    function syncOverlayTopWhileOpen() {
      if (!open) {
        return;
      }
      updateOverlayTop();
      window.addEventListener('resize', updateOverlayTop);
      return () => {
        window.removeEventListener('resize', updateOverlayTop);
      };
    },
    [open, updateOverlayTop]
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
        if (event.key === 'Escape') {
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

  if (!open) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={cn('absolute inset-x-6 bottom-0 z-pop flex min-h-0 flex-col', className)}
      style={{ top: overlayTop }}
    >
      <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border bg-background shadow-lg'>
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
    </div>
  );
}
