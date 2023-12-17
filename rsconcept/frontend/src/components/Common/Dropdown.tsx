import clsx from 'clsx';

import Overlay from './Overlay';

interface DropdownProps {
  stretchLeft?: boolean
  dimensions?: string
  children: React.ReactNode
}

function Dropdown({
  dimensions = 'w-fit',
  stretchLeft,
  children
}: DropdownProps) {
  return (
  <Overlay 
    layer='z-modal-tooltip'
    position='mt-3'
    className={clsx(
      'flex flex-col items-stretch',
      'border rounded-md shadow-lg',
      'text-sm',
      'clr-input',
      {
        'right-0': stretchLeft,
        'left-0': !stretchLeft
      },
      dimensions
  )}
  >
    {children}
  </Overlay>);
}

export default Dropdown;