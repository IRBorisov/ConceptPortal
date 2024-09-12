import clsx from 'clsx';

import { CProps } from '@/components/props';

export interface DividerProps extends CProps.Styling {
  /** Indicates whether the divider is vertical. */
  vertical?: boolean;

  /** Margins to apply to the divider `classNames`. */
  margins?: string;
}

/**
 * Divider component that renders a horizontal or vertical divider with customizable margins and styling.
 */
function Divider({ vertical, margins = 'mx-2', className, ...restProps }: DividerProps) {
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

export default Divider;
