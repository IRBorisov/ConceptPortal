'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { type Styling } from '../props';
import { cn } from '../utils';

const VIEWPORT_EDGE_PAD_PX = 8;

interface DropdownProps extends Styling {
  /** Reference to the dropdown element. */
  'ref'?: React.Ref<HTMLDivElement>;

  /** Unique ID for the dropdown. */
  'id'?: string;

  /** Margin for the dropdown. */
  'margin'?: string;

  /**
   * Open aligned to the right edge (menu grows left).
   * When omitted, side is chosen so the menu stays in the viewport.
   */
  'stretchLeft'?: boolean;

  /**
   * Open upward from the anchor.
   * When omitted, side is chosen so the menu stays in the viewport.
   */
  'stretchTop'?: boolean;

  /** Indicates whether the dropdown is open. */
  'isOpen': boolean;

  /** Optional ARIA role when the dropdown is not a true menu. */
  'role'?: React.AriaRole;

  /** Accessible name for non-menu disclosure groups. */
  'aria-label'?: string;
}

function resolveMargin(margin: string | undefined, openUp: boolean): string | undefined {
  if (!margin) {
    return undefined;
  }
  if (openUp && /\bmt-/.test(margin)) {
    return margin.replaceAll(/\bmt-/g, 'mb-');
  }
  if (!openUp && /\bmb-/.test(margin)) {
    return margin.replaceAll(/\bmb-/g, 'mt-');
  }
  return margin;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

/**
 * Animated list of children with optional positioning and visibility control.
 * Note: Dropdown should be inside a relative container.
 *
 * Horizontal/vertical alignment auto-flips to stay on screen unless `stretchLeft` /
 * `stretchTop` are set explicitly.
 */
export function Dropdown({
  isOpen,
  stretchLeft,
  stretchTop,
  margin,
  className,
  children,
  ref,
  ...restProps
}: React.PropsWithChildren<DropdownProps>) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [fitLeft, setFitLeft] = useState(false);
  const [fitTop, setFitTop] = useState(false);

  const autoHorizontal = stretchLeft === undefined;
  const autoVertical = stretchTop === undefined;

  useLayoutEffect(
    function fitDropdownToViewport() {
      if (!isOpen || (!autoHorizontal && !autoVertical)) {
        return;
      }

      const menu = menuRef.current;
      if (!menu) {
        return;
      }

      const anchor = menu.offsetParent instanceof HTMLElement ? menu.offsetParent : menu.parentElement;
      if (!anchor) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;
      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;

      if (autoHorizontal) {
        const fitsRight = anchorRect.left + menuWidth <= viewWidth - VIEWPORT_EDGE_PAD_PX;
        const fitsLeft = anchorRect.right - menuWidth >= VIEWPORT_EDGE_PAD_PX;
        if (!fitsRight && fitsLeft) {
          setFitLeft(true);
        } else if (!fitsRight && !fitsLeft) {
          setFitLeft(anchorRect.right > viewWidth - anchorRect.left);
        } else {
          setFitLeft(false);
        }
      }

      if (autoVertical) {
        const fitsBelow = anchorRect.bottom + menuHeight <= viewHeight - VIEWPORT_EDGE_PAD_PX;
        const fitsAbove = anchorRect.top - menuHeight >= VIEWPORT_EDGE_PAD_PX;
        if (!fitsBelow && fitsAbove) {
          setFitTop(true);
        } else if (!fitsBelow && !fitsAbove) {
          setFitTop(anchorRect.top > viewHeight - anchorRect.bottom);
        } else {
          setFitTop(false);
        }
      }
    },
    [autoHorizontal, autoVertical, children, isOpen]
  );

  const openLeft = stretchLeft ?? fitLeft;
  const openUp = stretchTop ?? fitTop;

  return (
    <div
      ref={node => {
        menuRef.current = node;
        assignRef(ref, node);
      }}
      tabIndex={-1}
      className={cn(
        'cc-dropdown isolate z-topmost absolute grid bg-popover border rounded-md shadow-lg text-sm',
        openLeft ? 'right-0' : 'left-0',
        openUp ? 'bottom-0' : 'top-full',
        isOpen && 'open',
        resolveMargin(margin, openUp),
        className
      )}
      inert={!isOpen}
      {...restProps}
    >
      {children}
    </div>
  );
}
