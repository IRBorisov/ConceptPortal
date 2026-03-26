import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { type Styling } from '../props';

interface TextContentProps extends Styling {
  /** Text to display. */
  text: string;

  /** Tooltip text */
  title?: string;
}

/** Displays text with a tooltip. */
export function Text({ className, text, title, ...restProps }: TextContentProps) {
  return (
    <div
      className={clsx('text-pretty', className)}
      data-tooltip-id={title ? globalIDs.value_tooltip : undefined}
      data-tooltip-content={title}
      {...restProps}
    >
      {text}
    </div>
  );
}
