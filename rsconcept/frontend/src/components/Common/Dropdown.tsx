import clsx from 'clsx';

import { CProps } from '../props';
import Overlay from './Overlay';

interface DropdownProps
extends CProps.Styling {
  stretchLeft?: boolean
  children: React.ReactNode
}

function Dropdown({
  className,
  stretchLeft,
  children,
  ...restProps
}: DropdownProps) {
  return (
  <Overlay 
    layer='z-modal-tooltip'
    position='mt-3'
    className={clsx(
      'flex flex-col',
      'border rounded-md shadow-lg',
      'text-sm',
      'clr-input',
      {
        'right-0': stretchLeft,
        'left-0': !stretchLeft
      },
      className
    )}
    {...restProps}
  >
    {children}
  </Overlay>);
}

export default Dropdown;