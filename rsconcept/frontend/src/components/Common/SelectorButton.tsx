import clsx from 'clsx';

interface SelectorButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title' | 'type'> {
  text?: string
  icon?: React.ReactNode
  tooltip?: string
  dimensions?: string
  borderClass?: string
  colors?: string
  transparent?: boolean
}

function SelectorButton({
  text, icon, tooltip,
  colors = 'clr-btn-default',
  dimensions = 'w-fit h-fit',
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
      !transparent && colors,
      dimensions
  )}
    title={tooltip}
    {...restProps}
  >
    {icon ? icon : null}
    {text ? <div className={'font-semibold whitespace-nowrap pb-1'}>{text}</div> : null}
  </button>);
}

export default SelectorButton;