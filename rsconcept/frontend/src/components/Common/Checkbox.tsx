import { useRef } from 'react';

import Label from './Label';

export interface CheckboxProps {
  id?: string
  label?: string
  required?: boolean
  disabled?: boolean
  widthClass?: string
  tooltip?: string
  value?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function Checkbox({ id, required, disabled, tooltip, label, widthClass = 'w-full', value, onChange }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const cursor = disabled ? 'cursor-not-allowed' : 'cursor-pointer';
  
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    if (!disabled) {
      inputRef.current?.click();
    }
  } 

  return (
    <button
      className={'flex gap-2 [&:not(:first-child)]:mt-3 ' + widthClass}
      title={tooltip}
      disabled={disabled}
      onClick={handleClick}
    >
      <input id={id} type='checkbox' ref={inputRef}
        className={`relative peer w-4 h-4 shrink-0 mt-0.5 border rounded-sm appearance-none clr-checkbox ${cursor}`}
        required={required}
        disabled={disabled}
        checked={value}
        onChange={onChange}
        tabIndex={-1}
      />
      { label && 
      <Label
        className={`${cursor}`}
        text={label}
        required={required}
        htmlFor={id}
      />}
      <svg
        className='absolute hidden w-3 h-3 mt-1 ml-0.5 text-white pointer-events-none peer-checked:block'
        viewBox='0 0 512 512'
        fill='currentColor'
      >
        <path d='M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z' />
      </svg>
    </button>
  );
}

export default Checkbox;
