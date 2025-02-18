import clsx from 'clsx';

import { CProps } from '@/components/props';
import { globals } from '@/utils/constants';
import { truncateToLastWord } from '@/utils/utils';

export interface TextContentProps extends CProps.Styling {
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
export function TextContent({ className, text, maxLength, noTooltip, ...restProps }: TextContentProps) {
  const truncated = maxLength ? truncateToLastWord(text, maxLength) : text;
  const isTruncated = maxLength && text.length > maxLength;
  return (
    <div
      className={clsx('text-xs text-pretty', className)}
      data-tooltip-id={isTruncated && !noTooltip ? globals.value_tooltip : undefined}
      data-tooltip-html={isTruncated && !noTooltip ? text : undefined}
      {...restProps}
    >
      {truncated}
    </div>
  );
}
