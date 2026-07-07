'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { type ITooltip, Tooltip as TooltipImpl } from 'react-tooltip';

import { useCoarsePointer } from '@/hooks/use-coarse-pointer';
import { usePreferencesStore } from '@/stores/preferences';
import { useTooltipsStore } from '@/stores/tooltips';

import { cn } from '../utils';

const DEFAULT_CLOSE_EVENTS = {
  mouseout: true,
  blur: true
} as const;

const TOUCH_CLOSE_EVENTS = {
  touchend: true,
  touchcancel: true
} as const;

const TOUCH_GLOBAL_CLOSE_EVENTS = {
  scroll: true,
  escape: true,
  clickOutsideAnchor: true
} as const;

export type { PlacesType } from 'react-tooltip';

interface TooltipProps extends Omit<ITooltip, 'variant'> {
  /** Text to display in the tooltip. */
  text?: string;

  /** Classname for z-index */
  layer?: string;

  /**
   * While the tooltip is already visible, `delayShow` is treated as 0 so anchors
   * sharing the same `id` can switch without waiting again. Pair with `delayHide`
   * long enough to cover pointer travel between nearby anchors. With `float`, pointer
   * position is tracked so the tooltip repositions immediately on anchor change.
   */
  instantWhenOpen?: boolean;
}

/**
 * Displays content in a tooltip container.
 */
export function Tooltip({
  text,
  children,
  layer = 'z-tooltip',
  place = 'bottom',
  className,
  instantWhenOpen,
  delayShow,
  afterShow,
  afterHide,
  float,
  position,
  closeEvents,
  globalCloseEvents,
  ...restProps
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const coarsePointer = useCoarsePointer();
  const resolvedFloat = Boolean(float && !coarsePointer);
  const trackPointerForFloat = Boolean(instantWhenOpen && resolvedFloat);
  const tooltipsEnabled = useTooltipsStore(state => state.tooltipsEnabled);
  const darkMode = usePreferencesStore(state => state.darkMode);

  useEffect(() => {
    if (!trackPointerForFloat) {
      return;
    }
    function syncPointer(event: PointerEvent) {
      if (event.pointerType === 'touch') {
        return;
      }
      setPointer({ x: event.clientX, y: event.clientY });
    }
    document.addEventListener('pointermove', syncPointer, { passive: true });
    document.addEventListener('pointerover', syncPointer, { passive: true });
    return () => {
      document.removeEventListener('pointermove', syncPointer);
      document.removeEventListener('pointerover', syncPointer);
    };
  }, [trackPointerForFloat]);

  if (typeof window === 'undefined') {
    return null;
  }

  const resolvedDelayShow = instantWhenOpen && open ? 0 : delayShow;
  const resolvedPosition = trackPointerForFloat && open && pointer ? pointer : position;
  const resolvedCloseEvents = coarsePointer
    ? { ...DEFAULT_CLOSE_EVENTS, ...TOUCH_CLOSE_EVENTS, ...closeEvents }
    : closeEvents;
  const resolvedGlobalCloseEvents = coarsePointer
    ? { ...TOUCH_GLOBAL_CLOSE_EVENTS, ...globalCloseEvents }
    : globalCloseEvents;

  function handleAfterShow(...args: Parameters<NonNullable<ITooltip['afterShow']>>) {
    if (instantWhenOpen) {
      setOpen(true);
    }
    afterShow?.(...args);
  }

  function handleAfterHide(...args: Parameters<NonNullable<ITooltip['afterHide']>>) {
    if (instantWhenOpen) {
      setOpen(false);
      setPointer(null);
    }
    afterHide?.(...args);
  }

  return createPortal(
    <TooltipImpl
      opacity={1}
      className={cn(
        'relative',
        'max-h-[calc(100svh-6rem)]',
        'overflow-y-auto overflow-x-hidden sm:overflow-hidden overscroll-contain',
        'border shadow-md',
        'text-pretty whitespace-pre-line',
        !tooltipsEnabled && 'hidden',
        layer,
        className
      )}
      classNameArrow={layer}
      variant={darkMode ? 'dark' : 'light'}
      place={place}
      delayShow={resolvedDelayShow}
      afterShow={instantWhenOpen ? handleAfterShow : afterShow}
      afterHide={instantWhenOpen ? handleAfterHide : afterHide}
      float={resolvedFloat}
      position={resolvedPosition}
      closeEvents={resolvedCloseEvents}
      globalCloseEvents={resolvedGlobalCloseEvents}
      {...restProps}
    >
      {text ? text : null}
      {children}
    </TooltipImpl>,
    document.body
  );
}
