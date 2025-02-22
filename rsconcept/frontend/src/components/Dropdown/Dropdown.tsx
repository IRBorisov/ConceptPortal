import clsx from 'clsx';

import { PARAMETER } from '@/utils/constants';

import { type Styling } from '../props';

interface DropdownProps extends Styling {
  /** Indicates whether the dropdown should stretch to the left. */
  stretchLeft?: boolean;

  /** Indicates whether the dropdown should stretch to the top. */
  stretchTop?: boolean;

  /** Indicates whether the dropdown is open. */
  isOpen: boolean;
}

/**
 *  Animated list of children with optional positioning and visibility control.
 */
export function Dropdown({
  isOpen,
  stretchLeft,
  stretchTop,
  className,
  children,
  style,
  ...restProps
}: React.PropsWithChildren<DropdownProps>) {
  return (
    <div className='relative'>
      <div
        tabIndex={-1}
        className={clsx(
          'z-topmost',
          'absolute mt-3',
          'flex flex-col',
          'border rounded-md shadow-lg',
          'text-sm',
          'clr-input',
          {
            'right-0': stretchLeft,
            'left-0': !stretchLeft,
            'bottom-[2rem]': stretchTop
          },
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
        {...restProps}
      >
        {children}
      </div>
    </div>
  );
}
