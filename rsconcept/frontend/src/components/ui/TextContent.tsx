import clsx from 'clsx';

import { globals } from '@/utils/constants';
import { truncateToLastWord } from '@/utils/utils';

import { CProps } from '../props';

export interface TextContentProps extends CProps.Styling {
  text: string;
  maxLength?: number;
  noTooltip?: boolean;
}

function TextContent({ className, text, maxLength, noTooltip, ...restProps }: TextContentProps) {
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

export default TextContent;
