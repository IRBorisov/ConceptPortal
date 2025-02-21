'use client';

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { type ITooltip, Tooltip as TooltipImpl } from 'react-tooltip';
import clsx from 'clsx';

import { usePreferencesStore } from '@/stores/preferences';

export type { PlacesType } from 'react-tooltip';

interface TooltipProps extends Omit<ITooltip, 'variant'> {
  /** Text to display in the tooltip. */
  text?: string;

  /** Classname for z-index */
  layer?: string;
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
  style,
  ...restProps
}: TooltipProps) {
  const darkMode = usePreferencesStore(state => state.darkMode);
  if (typeof window === 'undefined') {
    return null;
  }
  return createPortal(
    <TooltipImpl
      delayShow={750}
      delayHide={100}
      opacity={1}
      className={clsx(
        'max-h-[calc(100svh-6rem)]',
        'overflow-y-auto overflow-x-hidden sm:overflow-hidden overscroll-contain',
        'border shadow-md',
        'text-pretty',
        layer,
        className
      )}
      classNameArrow={layer}
      style={{ ...{ paddingTop: '2px', paddingBottom: '2px', paddingLeft: '8px', paddingRight: '8px' }, ...style }}
      variant={darkMode ? 'dark' : 'light'}
      place={place}
      {...restProps}
    >
      {text ? text : null}
      {children as ReactNode}
    </TooltipImpl>,
    document.body
  );
}
