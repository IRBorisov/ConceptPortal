import React from 'react';
import clsx from 'clsx';

import { type Styling } from '../props';

interface DropdownProps extends Styling {
  /** Reference to the dropdown element. */
  ref?: React.Ref<HTMLDivElement>;

  /** Unique ID for the dropdown. */
  id?: string;

  /** Margin for the dropdown. */
  margin?: string;

  /** Indicates whether the dropdown should stretch to the left. */
  stretchLeft?: boolean;

  /** Indicates whether the dropdown should stretch to the top. */
  stretchTop?: boolean;

  /** Indicates whether the dropdown is open. */
  isOpen: boolean;
}

/**
 *  Animated list of children with optional positioning and visibility control.
 *  Note: Dropdown should be inside a relative container.
 */
export function Dropdown({
  isOpen,
  stretchLeft,
  stretchTop,
  margin,
  className,
  children,
  ...restProps
}: React.PropsWithChildren<DropdownProps>) {
  return (
    <div
      tabIndex={-1}
      className={clsx(
        'cc-dropdown isolate z-topmost absolute grid bg-prim-0 border rounded-md shadow-lg text-sm',
        stretchLeft ? 'right-0' : 'left-0',
        stretchTop ? 'bottom-0' : 'top-full',
        isOpen && 'open',
        margin,
        className
      )}
      aria-hidden={!isOpen}
      inert={!isOpen}
      {...restProps}
    >
      {children}
    </div>
  );
}
