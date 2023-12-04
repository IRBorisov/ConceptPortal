import Checkbox from './Checkbox';

interface DropdownCheckboxProps {
  value: boolean
  label?: string
  tooltip?: string
  disabled?: boolean
  setValue?: (newValue: boolean) => void
}

function DropdownCheckbox({ tooltip, setValue, disabled, ...restProps }: DropdownCheckboxProps) {
  const behavior = (setValue && !disabled) ? 'clr-hover' : '';
  return (
  <div
    title={tooltip}
    className={`px-4 py-1 text-left overflow-ellipsis ${behavior} w-full whitespace-nowrap`}
  >
    <Checkbox 
      dimensions='w-full'
      disabled={disabled}
      setValue={setValue}
      {...restProps}
    /> 
  </div>);
}

export default DropdownCheckbox;
