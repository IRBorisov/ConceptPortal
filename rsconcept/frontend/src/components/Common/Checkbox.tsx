import { useMemo } from 'react';

import { CheckboxChecked } from '../Icons';
import Label from './Label';

export interface CheckboxProps {
  id?: string
  label?: string
  required?: boolean
  disabled?: boolean
  widthClass?: string
  tooltip?: string

  value: boolean
  setValue?: (newValue: boolean) => void
}

function Checkbox({ id, required, disabled, tooltip, label, widthClass = 'w-fit', value, setValue }: CheckboxProps) {
  const cursor = useMemo(
  () => {
    if (disabled) {
      return 'cursor-not-allowed';
    } else if (setValue) {
      return 'cursor-pointer';
    } else {
      return ''
    }
  }, [disabled, setValue]);
  const bgColor = useMemo(
  () => {
    return value !== false ? 'clr-primary' : 'clr-app'
  }, [value]);
  
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    if (disabled || !setValue) {
      return;
    }
    setValue(!value);
  }

  return (
    <button
      id={id}
      className={`flex items-center [&:not(:first-child)]:mt-3 clr-outline focus:outline-dotted focus:outline-1 ${widthClass}`}
      title={tooltip}
      disabled={disabled}
      onClick={handleClick}
    >
      <div className={`relative peer w-4 h-4 shrink-0 mt-0.5 border rounded-sm appearance-none ${bgColor} ${cursor}`} />
      { label && 
      <Label
        className={`${cursor} px-2 text-start`}
        text={label}
        required={required}
        htmlFor={id}
      />}
      {value && <CheckboxChecked />}
    </button>
  );
}

export default Checkbox;
