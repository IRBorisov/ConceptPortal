import { TextareaHTMLAttributes } from 'react';

import Label from './Label';

export interface TextAreaProps 
extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string
  widthClass?: string
  colorClass?: string
}

function TextArea({
  id, label, required,
  widthClass = 'w-full',
  colorClass = 'clr-input',
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3'>
      <Label
        text={label}
        required={required}
        htmlFor={id}
      />
      <textarea id={id}
          className={`px-3 py-2 mt-2 leading-tight border shadow ${colorClass} ${widthClass}`}
          rows={rows}
          required={required}
          {...props}
      />
    </div>
  );
}

export default TextArea;
