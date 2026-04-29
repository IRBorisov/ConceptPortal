'use client';

import { type ComponentProps } from 'react';
import clsx from 'clsx';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';
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
  ...restProps
}: TextContentProps) {
  const setActiveText = useValueTooltipStore(state => state.setActiveText);
  const truncated = maxLength ? truncateToLastWord(text, maxLength) : text;
  const isTruncated = Boolean(maxLength && text.length > maxLength);
  const showTooltip = isTruncated && !noTooltip;

  return (
    <div
      {...restProps}
      className={clsx('text-xs text-pretty', className)}
      data-tooltip-id={showTooltip ? globalIDs.value_tooltip : undefined}
      onPointerEnter={
        showTooltip
          ? event => {
              onPointerEnter?.(event);
              setActiveText(text);
            }
          : onPointerEnter
      }
    >
      {truncated}
    </div>
  );
}
