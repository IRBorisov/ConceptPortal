'use client';

import { type ComponentProps } from 'react';

import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';

import { cn } from '../utils';

interface TextProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Text to display. */
  text: string;

  /** Tooltip text */
  title?: string;
}

/** Displays text with a tooltip. */
export function Text({ className, text, title, onPointerEnter, onPointerLeave, ...restProps }: TextProps) {
  const tooltipAnchor = useValueTooltipAnchor(title ?? null);

  return (
    <div
      {...restProps}
      {...tooltipAnchor}
      className={cn('text-pretty', className)}
      onPointerEnter={
        title || onPointerEnter
          ? event => {
              tooltipAnchor.onPointerEnter?.(event);
              onPointerEnter?.(event);
            }
          : onPointerEnter
      }
      onPointerLeave={
        title || onPointerLeave
          ? event => {
              tooltipAnchor.onPointerLeave?.(event);
              onPointerLeave?.(event);
            }
          : onPointerLeave
      }
    >
      {text}
    </div>
  );
}
