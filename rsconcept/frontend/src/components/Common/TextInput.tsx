import { type InputHTMLAttributes } from 'react';

import Label from './Label';

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string
  label: string
  widthClass?: string
}

function TextInput({
  id, required, label, widthClass = 'w-full',
  ...props
}: TextInputProps) {
  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3'>
      <Label
        text={label}
        required={required}
        htmlFor={id}
      />
      <input id={id}
        className={'px-3 py-2 mt-2 leading-tight border shadow dark:bg-gray-800 truncate hover:text-clip ' + widthClass}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextInput;
