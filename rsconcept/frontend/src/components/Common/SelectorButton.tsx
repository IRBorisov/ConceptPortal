import clsx from 'clsx';

import { CProps } from '../props';

interface SelectorButtonProps
extends CProps.Button {
  text?: string
  icon?: React.ReactNode

  colors?: string
  transparent?: boolean
}

function SelectorButton({
  text, icon,
  colors = 'clr-btn-default',
  className,
  transparent,
  ...restProps
}: SelectorButtonProps) {
  return (
  <button type='button'
    className={clsx(
      'px-1 flex flex-start items-center gap-1',
      'text-sm small-caps select-none',
      'text-btn clr-text-controls',
      'disabled:cursor-not-allowed cursor-pointer',
      {
        'clr-hover': transparent,
        'border': !transparent,
      },
      className,
      !transparent && colors
    )}
    {...restProps}
  >
    {icon ? icon : null}
    {text ? <div className={'font-semibold whitespace-nowrap pb-1'}>{text}</div> : null}
  </button>);
}

export default SelectorButton;