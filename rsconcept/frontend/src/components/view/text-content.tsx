import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';
import { truncateToLastWord } from '@/utils/utils';

import { type Styling } from '../props';

export interface TextContentProps extends Styling {
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
      data-tooltip-id={isTruncated && !noTooltip ? globalIDs.value_tooltip : undefined}
      data-tooltip-html={isTruncated && !noTooltip ? text : undefined}
      {...restProps}
    >
      {truncated}
    </div>
  );
}
