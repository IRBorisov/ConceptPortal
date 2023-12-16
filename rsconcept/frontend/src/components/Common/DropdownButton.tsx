import clsx from 'clsx';

interface DropdownButtonProps {
  text?: string
  icon?: React.ReactNode

  className?: string
  tooltip?: string | undefined
  onClick?: () => void
  disabled?: boolean

  children?: React.ReactNode
}

function DropdownButton({
  text, icon, children,
  tooltip, className,
  disabled,
  onClick
}: DropdownButtonProps) {
  return (
  <button type='button'
    disabled={disabled}
    title={tooltip}
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
  >
    {children ? children : null}
    {!children && icon ? icon : null}
    {!children && text ? <span>{text}</span> : null}
  </button>);
}

export default DropdownButton;