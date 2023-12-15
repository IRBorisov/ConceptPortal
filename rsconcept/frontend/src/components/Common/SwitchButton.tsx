import clsx from 'clsx';

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
  isSelected, onSelect, ...restProps
}: SwitchButtonProps<ValueType>) {
  return (
  <button type='button' tabIndex={-1}
    title={tooltip}
    onClick={() => onSelect(value)}
    className={clsx(
      'px-2 py-1',
      'border rounded-none',
      'font-semibold small-caps',
      'clr-btn-clear clr-hover',
      'cursor-pointer',
      isSelected && 'clr-selected',
      dimensions
    )}
    {...restProps}
  >
    {icon ? icon : null}
    {label}
  </button>);
}

export default SwitchButton;