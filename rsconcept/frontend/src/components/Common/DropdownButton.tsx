import clsx from 'clsx';

interface DropdownButtonProps {
  tooltip?: string | undefined
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

function DropdownButton({ tooltip, onClick, disabled, children }: DropdownButtonProps) {
  return (
  <button type='button'
    disabled={disabled}
    title={tooltip}
    onClick={onClick}
    className={clsx(
      'px-3 py-1',
      'text-left overflow-ellipsis whitespace-nowrap',
      'disabled:clr-text-controls',
      {
        'clr-hover': onClick,
        'cursor-pointer disabled:cursor-not-allowed': onClick,
        'cursor-default': !onClick
      }
    )}
  >
    {children}
  </button>);
}

export default DropdownButton;