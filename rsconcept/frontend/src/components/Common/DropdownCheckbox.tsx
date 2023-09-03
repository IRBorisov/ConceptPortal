import Checkbox from './Checkbox';

interface DropdownCheckboxProps {
  label?: string
  tooltip?: string
  disabled?: boolean
  value?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function DropdownCheckbox({ tooltip, onChange, disabled, ...props }: DropdownCheckboxProps) {
  const behavior = (onChange && !disabled ? 'clr-hover' : '');
  return (
    <div
      title={tooltip}
      className={`px-4 py-1 text-left overflow-ellipsis ${behavior} w-full whitespace-nowrap`}
    >
      <Checkbox 
        widthClass='w-full'
        disabled={disabled}
        onChange={onChange}
        {...props}
      /> 
    </div>
  );
}

export default DropdownCheckbox;
