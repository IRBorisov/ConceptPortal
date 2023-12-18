import clsx from 'clsx';

import { IColorsProps, IControlProps } from './commonInterfaces';

interface ButtonProps
extends IControlProps, IColorsProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'| 'type'> {
  text?: string
  icon?: React.ReactNode

  dense?: boolean
  loading?: boolean
}

function Button({
  text, icon, tooltip, loading,
  dense, disabled, noBorder, noOutline,
  colors = 'clr-btn-default',
  className,
  ...restProps
}: ButtonProps) {
  return (
  <button type='button'
    disabled={disabled ?? loading}
    title={tooltip}
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
      colors,
      className
    )}
    {...restProps}
  >
    {icon ? icon : null}
    {text ? <span className='font-semibold'>{text}</span> : null}
  </button>);
}

export default Button;