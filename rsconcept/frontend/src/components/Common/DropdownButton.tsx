interface NavigationTextItemProps {
  description?: string | undefined
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

function DropdownButton({ description = '', onClick, disabled, children }: NavigationTextItemProps) {
  const behavior = (onClick ? 'cursor-pointer clr-hover' : 'cursor-default') + ' disabled:cursor-not-allowed';
  return (
    <button
      disabled={disabled}
      title={description}
      onClick={onClick}
      className={`px-3 py-1 text-left overflow-ellipsis ${behavior} whitespace-nowrap`}
    >
      {children}
    </button>
  );
}

export default DropdownButton;
