'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ITooltip, Tooltip } from 'react-tooltip';

import { useConceptTheme } from '@/context/ThemeContext';

interface ConceptTooltipProps
extends Omit<ITooltip, 'variant'> {
  layer?: string
  text?: string
}

function ConceptTooltip({
  text, children,
  layer='z-tooltip',
  place='bottom',
  className,
  style,
  ...restProps
}: ConceptTooltipProps) {
  const { darkMode } = useConceptTheme();
  if (typeof window === 'undefined') {
    return null;
  }
  return createPortal(
  (<Tooltip
    delayShow={1000}
    delayHide={100}
    opacity={0.97}
    className={clsx(
      'overflow-hidden',
      'border shadow-md',
      layer,
      className
    )}
    classNameArrow={layer}
    style={{...{ paddingTop: '2px', paddingBottom: '2px'}, ...style}}
    variant={(darkMode ? 'dark' : 'light')}
    place={place}
    {...restProps}
  >
    {text ? text : null}
    {children as ReactNode}
  </Tooltip>), document.body);
}

export default ConceptTooltip;