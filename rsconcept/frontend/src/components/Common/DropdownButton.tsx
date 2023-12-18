import clsx from 'clsx';

import { CProps } from '../props';

interface DropdownButtonProps
extends CProps.Button {
  text?: string
  icon?: React.ReactNode

  children?: React.ReactNode
}

function DropdownButton({
  text, icon, className, onClick,
  children,
  ...restProps
}: DropdownButtonProps) {
  return (
  <button type='button'
    onClick={onClick}
    className={clsx(
      'px-3 py-1 inline-flex items-center gap-2',
      'text-left text-sm overflow-ellipsis whitespace-nowrap',
      'disabled:clr-text-controls',
      {
        'clr-hover': onClick,
        'cursor-pointer disabled:cursor-not-allowed': onClick,
        'cursor-default': !onClick
      },
      className
    )}
    {...restProps}
  >
    {children ? children : null}
    {!children && icon ? icon : null}
    {!children && text ? <span>{text}</span> : null}
  </button>);
}

export default DropdownButton;