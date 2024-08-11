import clsx from 'clsx';

import { globals } from '@/utils/constants';
import { truncateText } from '@/utils/utils';

import { CProps } from '../props';

export interface TextContentProps extends CProps.Styling {
  text: string;
  maxLength?: number;
}

function TextContent({ className, text, maxLength, ...restProps }: TextContentProps) {
  const truncated = maxLength ? truncateText(text, maxLength) : text;
  const isTruncated = maxLength && text.length > maxLength;
  return (
    <div
      className={clsx('text-xs text-pretty', className)}
      data-tooltip-id={isTruncated ? globals.tooltip : undefined}
      data-tooltip-content={isTruncated ? text : undefined}
      {...restProps}
    >
      {truncated}
    </div>
  );
}

export default TextContent;
