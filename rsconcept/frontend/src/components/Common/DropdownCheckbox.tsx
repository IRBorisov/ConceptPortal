import clsx from 'clsx';

import Checkbox from './Checkbox';

interface DropdownCheckboxProps {
  value: boolean
  label?: string
  tooltip?: string
  disabled?: boolean
  setValue?: (newValue: boolean) => void
}

function DropdownCheckbox({ tooltip, setValue, disabled, ...restProps }: DropdownCheckboxProps) {
  return (
  <div
    title={tooltip}
    className={clsx(
      'px-3 py-1',
      'text-left overflow-ellipsis whitespace-nowrap',
      'disabled:clr-text-controls',
      !!setValue && !disabled && 'clr-hover'
    )}
  >
    <Checkbox
      disabled={disabled}
      setValue={setValue}
      {...restProps}
    /> 
  </div>);
}

export default DropdownCheckbox;