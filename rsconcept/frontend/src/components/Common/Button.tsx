import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CProps } from '../props';

interface ButtonProps
extends CProps.Control, CProps.Colors, CProps.Button {
  text?: string
  icon?: React.ReactNode

  dense?: boolean
  loading?: boolean
}

function Button({
  text, icon, title,
  loading, dense, disabled, noBorder, noOutline,
  colors = 'clr-btn-default',
  className,
  ...restProps
}: ButtonProps) {
  return (
  <button type='button'
    disabled={disabled ?? loading}
    className={clsx(
      'inline-flex gap-2 items-center justify-center',
      'select-none disabled:cursor-not-allowed',
      {
        'border rounded': !noBorder,
        'px-1': dense,
        'px-3 py-2': !dense,
        'cursor-progress': loading,
        'cursor-pointer': !loading,
        'outline-none': noOutline,
        'clr-outline': !noOutline,
      },
      className,
      colors
    )}
    data-tooltip-id={title ? (globalIDs.tooltip) : undefined}
    data-tooltip-content={title}
    {...restProps}
  >
    {icon ? icon : null}
    {text ? <span className='font-semibold'>{text}</span> : null}
  </button>);
}

export default Button;