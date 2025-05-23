'use client';

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { type ITooltip, Tooltip as TooltipImpl } from 'react-tooltip';

import { usePreferencesStore } from '@/stores/preferences';

import { cn } from '../utils';

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
      className={cn(
        'relative',
        'py-0.5! px-2!',
        'max-h-[calc(100svh-6rem)]',
        'overflow-y-auto overflow-x-hidden sm:overflow-hidden overscroll-contain',
        'border shadow-md',
        'text-pretty',
        layer,
        className
      )}
      classNameArrow={layer}
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
