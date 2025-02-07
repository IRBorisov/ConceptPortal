import clsx from 'clsx';

import { CProps } from '@/components/props';

interface DividerProps extends CProps.Styling {
  /** Indicates whether the divider is vertical. */
  vertical?: boolean;

  /** Margins to apply to the divider `classNames`. */
  margins?: string;
}

/**
 * Horizontal or vertical divider with customizable margins and styling.
 */
export function Divider({ vertical, margins = 'mx-2', className, ...restProps }: DividerProps) {
  return (
    <div
      className={clsx(
        margins, //prettier: split-lines
        className,
        {
          'border-x': vertical,
          'border-y': !vertical
        }
      )}
      {...restProps}
    />
  );
}
