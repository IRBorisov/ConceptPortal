
import { useMemo } from 'react';

import { CheckboxChecked, CheckboxNull } from '../Icons';
import { CheckboxProps } from './Checkbox';
import Label from './Label';

export interface TristateProps
extends Omit<CheckboxProps, 'value' | 'setValue'> {
  value: boolean | null
  setValue?: (newValue: boolean | null) => void
}

function Checkbox({ id, required, disabled, tooltip, label, widthClass = 'w-fit', value, setValue }: TristateProps) {
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
    if (value === false) {
        setValue(null); 
    } else {
      setValue(!value);
    }
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
      {value === null && <CheckboxNull />}
    </button>
  );
}

export default Checkbox;
