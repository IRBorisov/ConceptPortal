import clsx from 'clsx';

import { CProps } from '../props';

interface MiniButtonProps
extends CProps.Button {
  icon: React.ReactNode
  noHover?: boolean
}

function MiniButton({
  icon, noHover, tabIndex,
  className,
  ...restProps
}: MiniButtonProps) {
  return (
  <button type='button'
    tabIndex={tabIndex ?? -1}
    className={clsx(
      'px-1 py-1',
      'rounded-full',
      'clr-btn-clear',
      'cursor-pointer disabled:cursor-not-allowed',
      {
        'outline-none': noHover,
        'clr-hover': !noHover
      },
      className
    )}
    {...restProps}
  >
    {icon}
  </button>);
}

export default MiniButton;