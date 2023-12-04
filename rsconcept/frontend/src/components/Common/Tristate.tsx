
import { useMemo } from 'react';

import { CheckboxCheckedIcon, CheckboxNullIcon } from '../Icons';
import { CheckboxProps } from './Checkbox';
import Label from './Label';

export interface TristateProps
extends Omit<CheckboxProps, 'value' | 'setValue'> {
  value: boolean | null
  setValue?: (newValue: boolean | null) => void
}

function Tristate({
  id, disabled, tooltip, label, 
  dimensions = 'w-fit',
  value, setValue,
  ...restProps
}: TristateProps) {
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
    } else if (value === null) {
      setValue(true);
    } else {
      setValue(false);
    }
  }

  return (
  <button type='button' id={id}
    className={`flex items-center clr-outline focus:outline-dotted focus:outline-1 ${dimensions}`}
    title={tooltip}
    disabled={disabled}
    onClick={handleClick}
    {...restProps}
  >
    <div className={`w-4 h-4 shrink-0 mt-0.5 border rounded-sm ${bgColor} ${cursor}`} >
      {value ? <div className='mt-[1px] ml-[1px]'><CheckboxCheckedIcon /></div> : null}
      {value == null ? <div className='mt-[1px] ml-[1px]'><CheckboxNullIcon /></div> : null}
    </div>
    {label ? 
    <Label
      className={`${cursor} px-2 text-start`}
      text={label}
      htmlFor={id}
    /> : null}
  </button>);
}

export default Tristate;
