'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ITooltip, Tooltip as TooltipImpl } from 'react-tooltip';

import { useConceptTheme } from '@/context/ThemeContext';

export type { PlacesType } from 'react-tooltip';

interface TooltipProps extends Omit<ITooltip, 'variant'> {
  layer?: string;
  text?: string;
}

function Tooltip({
  text,
  children,
  layer = 'z-tooltip',
  place = 'bottom',
  className,
  style,
  ...restProps
}: TooltipProps) {
  const { darkMode } = useConceptTheme();
  if (typeof window === 'undefined') {
    return null;
  }
  return createPortal(
    <TooltipImpl
      delayShow={1000}
      delayHide={100}
      opacity={0.97}
      className={clsx('overflow-hidden', 'border shadow-md', layer, className)}
      classNameArrow={layer}
      style={{ ...{ paddingTop: '2px', paddingBottom: '2px' }, ...style }}
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

export default Tooltip;
