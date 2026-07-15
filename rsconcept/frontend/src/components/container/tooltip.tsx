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

const TOOLTIP_VIEWPORT_PADDING_PX = 8;

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

  useEffect(function startTooltipViewportGuard() {
    ensureTooltipViewportGuard();
  }, []);

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
    // Tall left/right placements can end up with top < 0; clamp after paint/Suspense resize.
    scheduleTooltipViewportClamp();
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
      positionStrategy='fixed'
      className={cn(
        // Scroll lives on `.react-tooltip-content-wrapper` (see overrides.css) so the
        // abspos arrow does not participate in the scrollport / clip the first lines.
        'rounded-lg! max-h-[calc(100svh-6rem)]',
        'border shadow-md',
        'text-left text-pretty whitespace-pre-line',
        !tooltipsEnabled && 'hidden',
        layer,
        className
      )}
      classNameArrow={layer}
      variant={darkMode ? 'dark' : 'light'}
      place={place}
      delayShow={resolvedDelayShow}
      afterShow={handleAfterShow}
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

/** Keep open tooltips inside the viewport and reset scroll to the true content start. */
function clampVisibleTooltipsInViewport(options?: { resetScroll?: boolean }) {
  const resetScroll = options?.resetScroll ?? false;
  document.querySelectorAll<HTMLElement>('.react-tooltip.react-tooltip__show').forEach(tooltip => {
    const rect = tooltip.getBoundingClientRect();
    if (rect.height <= 0) {
      return;
    }
    if (rect.top < TOOLTIP_VIEWPORT_PADDING_PX) {
      tooltip.style.top = `${TOOLTIP_VIEWPORT_PADDING_PX}px`;
    }
    if (resetScroll) {
      tooltip.scrollTop = 0;
      const content = tooltip.querySelector<HTMLElement>('.react-tooltip-content-wrapper');
      if (content) {
        content.scrollTop = 0;
      }
    }
  });
}

function scheduleTooltipViewportClamp() {
  function clampAndResetScroll() {
    clampVisibleTooltipsInViewport({ resetScroll: true });
  }
  function clampOnly() {
    clampVisibleTooltipsInViewport();
  }
  requestAnimationFrame(function clampTooltipFrame() {
    clampAndResetScroll();
    // Later passes clamp only — do not yank scroll back to the top if the user started reading.
    requestAnimationFrame(clampOnly);
  });
  window.setTimeout(clampOnly, 50);
  window.setTimeout(clampOnly, 250);
}

let tooltipViewportGuardStarted = false;

function isOpenTooltip(node: Node): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    node.classList.contains('react-tooltip') &&
    node.classList.contains('react-tooltip__show')
  );
}

/** One shared observer for Suspense/content resize after open. */
function ensureTooltipViewportGuard() {
  if (tooltipViewportGuardStarted || typeof window === 'undefined') {
    return;
  }
  tooltipViewportGuardStarted = true;

  const resizeObserver = new ResizeObserver(function onTooltipResize() {
    clampVisibleTooltipsInViewport();
  });

  function observeTooltip(tooltip: HTMLElement) {
    resizeObserver.observe(tooltip);
    const content = tooltip.querySelector('.react-tooltip-content-wrapper');
    if (content) {
      resizeObserver.observe(content);
    }
  }

  function watchOpenTooltips(mutations?: MutationRecord[]) {
    if (!mutations) {
      document.querySelectorAll<HTMLElement>('.react-tooltip.react-tooltip__show').forEach(observeTooltip);
      return;
    }

    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && isOpenTooltip(mutation.target)) {
        observeTooltip(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        if (isOpenTooltip(node)) {
          observeTooltip(node);
        }
        node.querySelectorAll('.react-tooltip.react-tooltip__show').forEach(function observeFound(tooltip) {
          if (tooltip instanceof HTMLElement) {
            observeTooltip(tooltip);
          }
        });
        if (
          node.classList.contains('react-tooltip-content-wrapper') &&
          node.parentElement &&
          isOpenTooltip(node.parentElement)
        ) {
          resizeObserver.observe(node);
        }
      }
    }
  }

  watchOpenTooltips();
  new MutationObserver(function onTooltipDomChange(mutations) {
    watchOpenTooltips(mutations);
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}
