import clsx from 'clsx';

import { CProps } from '../props';

interface SwitchButtonProps<ValueType>
extends CProps.Styling {
  id?: string
  value: ValueType
  label?: string
  icon?: React.ReactNode
  title?: string

  isSelected?: boolean
  onSelect: (value: ValueType) => void
}

function SwitchButton<ValueType>({
  value, icon, label, className,
  isSelected, onSelect, ...restProps
}: SwitchButtonProps<ValueType>) {
  return (
  <button type='button' tabIndex={-1}
    onClick={() => onSelect(value)}
    className={clsx(
      'px-2 py-1',
      'border rounded-none',
      'font-semibold small-caps',
      'clr-btn-clear clr-hover',
      'cursor-pointer',
      isSelected && 'clr-selected',
      className
    )}
    {...restProps}
  >
    {icon ? icon : null}
    {label}
  </button>);
}

export default SwitchButton;