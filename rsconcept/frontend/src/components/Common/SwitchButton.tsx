interface SwitchButtonProps<ValueType> {
  id?: string
  value: ValueType
  label?: string
  icon?: React.ReactNode
  tooltip?: string
  dimensions?: string

  isSelected?: boolean
  onSelect: (value: ValueType) => void
}

function SwitchButton<ValueType>({
  value, icon, label, tooltip,
  dimensions='w-fit h-fit',
  isSelected, onSelect, ...props
}: SwitchButtonProps<ValueType>) {
  return (
  <button type='button' tabIndex={-1}
    title={tooltip}
    onClick={() => onSelect(value)}
    className={`px-2 py-1 border font-semibold small-caps rounded-none cursor-pointer clr-btn-clear clr-hover ${dimensions} ${isSelected ? 'clr-selected': ''}`}
    {...props}
  >
    {icon && icon}
    {label}
  </button>);
}

export default SwitchButton;
