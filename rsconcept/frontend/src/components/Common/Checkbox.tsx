import { useMemo } from 'react';

import { CheckboxCheckedIcon } from '../Icons';
import Label from './Label';

export interface CheckboxProps
extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'title' | 'value' | 'onClick' > {
  label?: string
  disabled?: boolean
  dimensions?: string
  tooltip?: string

  value: boolean
  setValue?: (newValue: boolean) => void
}

function Checkbox({
  id, disabled, tooltip, label, 
  dimensions = 'w-fit', value, setValue, ...restProps
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
    <button type='button' id={id}
      className={`flex items-center outline-none ${dimensions}`}
      title={tooltip}
      disabled={disabled}
      onClick={handleClick}
      {...restProps}
    >
      <div className={`max-w-[1rem] min-w-[1rem] h-4 mt-0.5 border rounded-sm ${bgColor} ${cursor}`} >
        {value ?
        <div className='mt-[1px] ml-[1px]'>
          <CheckboxCheckedIcon />
        </div> : null}
      </div>
      {label ?
      <Label
        className={`${cursor} px-2 text-start`}
        text={label}
        htmlFor={id}
      /> : null}
    </button>
  );
}

export default Checkbox;
