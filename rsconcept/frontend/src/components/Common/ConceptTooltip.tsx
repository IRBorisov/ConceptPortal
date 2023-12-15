'use client';

import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { ITooltip, Tooltip } from 'react-tooltip';

import { useConceptTheme } from '@/context/ThemeContext';

interface ConceptTooltipProps
extends Omit<ITooltip, 'variant'> {
  layer?: string
}

function ConceptTooltip({
  className,
  layer='z-tooltip',
  place='bottom',
  style,
  ...restProps
}: ConceptTooltipProps) {
  const { darkMode } = useConceptTheme();

  if (typeof window === 'undefined') {
    return null;
  }
  return createPortal(
  <Tooltip
    opacity={0.97}
    style={{...{ paddingTop: '2px', paddingBottom: '2px'}, ...style}}
    className={clsx(
      'overflow-auto',
      'border shadow-md',
      layer,
      className
    )}
    variant={(darkMode ? 'dark' : 'light')}
    place={place}
    {...restProps}
  />, document.body);
}

export default ConceptTooltip;