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
  <Tooltip
    delayShow={500}
    opacity={0.97}
    className={clsx(
      'overflow-auto',
      'border shadow-md',
      layer,
      className
    )}
    style={{...{ paddingTop: '2px', paddingBottom: '2px'}, ...style}}
    variant={(darkMode ? 'dark' : 'light')}
    place={place}
    {...restProps}
  />, document.body);
}

export default ConceptTooltip;