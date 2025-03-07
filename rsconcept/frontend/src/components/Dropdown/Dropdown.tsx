import clsx from 'clsx';

import { PARAMETER } from '@/utils/constants';

import { type Styling } from '../props';

interface DropdownProps extends Styling {
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
  style,
  ...restProps
}: React.PropsWithChildren<DropdownProps>) {
  return (
    <div
      tabIndex={-1}
      className={clsx(
        'z-topmost absolute',
        {
          'right-0': stretchLeft,
          'left-0': !stretchLeft,
          'bottom-0': stretchTop,
          'top-full': !stretchTop
        },
        'grid',
        'border rounded-md shadow-lg',
        'clr-input',
        'text-sm',
        margin,
        className
      )}
      style={{
        willChange: 'clip-path, transform',
        transitionProperty: 'clip-path, transform',
        transitionDuration: `${PARAMETER.dropdownDuration}ms`,
        transitionTimingFunction: 'ease-in-out',
        transform: isOpen ? 'translateY(0)' : 'translateY(-10%)',
        clipPath: isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(10% 0% 90% 0%)',
        ...style
      }}
      aria-hidden={!isOpen}
      {...restProps}
    >
      {children}
    </div>
  );
}
