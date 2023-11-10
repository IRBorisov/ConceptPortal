interface DropdownButtonProps {
  tooltip?: string | undefined
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

function DropdownButton({ tooltip, onClick, disabled, children }: DropdownButtonProps) {
  const behavior = (onClick ? 'cursor-pointer disabled:cursor-not-allowed clr-hover' : 'cursor-default');
  const text = disabled ? 'text-controls' : '';
  return (
    <button
      disabled={disabled}
      title={tooltip}
      onClick={onClick}
      className={`px-3 py-1 text-left overflow-ellipsis whitespace-nowrap ${behavior} ${text}`}
    >
      {children}
    </button>
  );
}

export default DropdownButton;
