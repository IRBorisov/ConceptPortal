import { useMemo } from 'react';

import { CheckboxCheckedIcon } from '../Icons';
import Label from './Label';

export interface CheckboxProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title' | 'value' | 'onClick' > {
  id?: string
  label?: string
  required?: boolean
  disabled?: boolean
  dimensions?: string
  tooltip?: string

  value: boolean
  setValue?: (newValue: boolean) => void
}

function Checkbox({
  id, required, disabled, tooltip, label, 
  dimensions = 'w-fit', value, setValue, ...props
}: CheckboxProps) {
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
      className={`flex items-center clr-outline focus:outline-dotted focus:outline-1 ${dimensions}`}
      title={tooltip}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      <div className={`max-w-[1rem] min-w-[1rem] h-4 mt-0.5 border rounded-sm ${bgColor} ${cursor}`} >
        { value && <div className='mt-[1px] ml-[1px]'><CheckboxCheckedIcon /></div>}
      </div>
      { label && 
      <Label
        className={`${cursor} px-2 text-start`}
        text={label}
        required={required}
        htmlFor={id}
      />}
    </button>
  );
}

export default Checkbox;
