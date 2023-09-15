import { TextareaHTMLAttributes } from 'react';

import Label from './Label';

export interface TextAreaProps 
extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'title'> {
  label: string
  tooltip?: string
  dimensions?: string
  colorClass?: string
}

function TextArea({
  id, label, required, tooltip,
  dimensions = 'w-full',
  colorClass = 'clr-input',
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <div className='flex flex-col items-start gap-2'>
      {label && <Label
        text={label}
        required={!props.disabled && required}
        htmlFor={id}
      />}
      <textarea id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight border shadow clr-outline ${colorClass} ${dimensions}`}
        rows={rows}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextArea;
