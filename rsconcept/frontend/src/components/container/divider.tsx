import { type Styling } from '../props';
import { cn } from '../utils';

interface DividerProps extends Styling {
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
      className={cn(
        vertical ? 'border-x' : 'border-y', //
        margins,
        className
      )}
      {...restProps}
    />
  );
}
