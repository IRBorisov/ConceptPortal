import { type InputHTMLAttributes } from 'react';

import Label from './Label';

interface TextInputProps
extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string
  label: string
  widthClass?: string
  colorClass?: string
  singleRow?: boolean
}

function TextInput({
  id, required, label, singleRow,
  widthClass = 'w-full',
  colorClass = 'clr-input',
  ...props
}: TextInputProps) {
  return (
    <div className={`flex ${singleRow ? 'items-center gap-4' : 'flex-col items-start'}  [&:not(:first-child)]:mt-3`}>
      <Label
        text={label}
        required={required}
        htmlFor={id}
      />
      <input id={id}
        className={`px-3 py-2 mt-2 leading-tight border shadow truncate hover:text-clip ${colorClass} ${widthClass}`}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextInput;
