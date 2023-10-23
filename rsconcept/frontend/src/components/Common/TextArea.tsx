import { TextareaHTMLAttributes } from 'react';

import Label from './Label';

export interface TextAreaProps 
extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'title'> {
  label?: string
  tooltip?: string
  dimensions?: string
  dense?: boolean
  colorClass?: string
}

function TextArea({
  id, label, required, tooltip, dense,
  dimensions = 'w-full',
  colorClass = 'clr-input',
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <div className={`flex ${dense ? 'items-center gap-4 ' + dimensions : 'flex-col items-start gap-2'}`}>
      {label && 
      <Label
        text={label}
        htmlFor={id}
      />}
      <textarea id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight border clr-outline ${colorClass} ${dense ? 'w-full' : dimensions}`}
        rows={rows}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextArea;
