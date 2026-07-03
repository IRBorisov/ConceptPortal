'use client';

import { type ComponentProps } from 'react';
import clsx from 'clsx';

import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';
import { truncateToLastWord } from '@/utils/format';

interface TextContentProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Text to display. */
  text: string;

  /** Maximum number of symbols to display. */
  maxLength?: number;

  /** Disable full text in a tooltip. */
  noTooltip?: boolean;
}

/**
 * Displays text limited to a certain number of symbols.
 */
export function TextContent({
  className,
  text,
  maxLength,
  noTooltip,
  onPointerEnter,
  onPointerLeave,
  ...restProps
}: TextContentProps) {
  const truncated = maxLength ? truncateToLastWord(text, maxLength) : text;
  const isTruncated = Boolean(maxLength && text.length > maxLength);
  const showTooltip = isTruncated && !noTooltip;
  const tooltipAnchor = useValueTooltipAnchor(showTooltip ? text : null);

  return (
    <div
      {...restProps}
      {...tooltipAnchor}
      className={clsx('text-xs text-pretty', className)}
      onPointerEnter={
        showTooltip || onPointerEnter
          ? event => {
              tooltipAnchor.onPointerEnter?.(event);
              onPointerEnter?.(event);
            }
          : onPointerEnter
      }
      onPointerLeave={
        showTooltip || onPointerLeave
          ? event => {
              tooltipAnchor.onPointerLeave?.(event);
              onPointerLeave?.(event);
            }
          : onPointerLeave
      }
    >
      {truncated}
    </div>
  );
}
