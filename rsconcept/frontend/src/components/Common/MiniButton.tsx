import clsx from 'clsx';

interface MiniButtonProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'title' | 'children' > {
  icon: React.ReactNode
  tooltip?: string
  noHover?: boolean
  dimensions?: string
}

function MiniButton({
  icon, tooltip, noHover, tabIndex,
  dimensions='w-fit h-fit',
  ...restProps
}: MiniButtonProps) {
  return (
  <button type='button'
    title={tooltip}
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
      dimensions
    )}
    {...restProps}
  >
    {icon}
  </button>);
}

export default MiniButton;