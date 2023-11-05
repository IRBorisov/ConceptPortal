import { TextareaHTMLAttributes } from 'react';

import { IColorsProps, IEditorProps } from '../commonInterfaces';
import Label from './Label';

export interface TextAreaProps 
extends IEditorProps, IColorsProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'title'> {
  dense?: boolean
}

function TextArea({
  id, label, required, tooltip, dense, noBorder, noOutline,
  dimensions = 'w-full',
  colors = 'clr-input',
  rows = 4,
  ...props
}: TextAreaProps) {
  const borderClass = noBorder ? '': 'border';
  const outlineClass = noOutline ? '': 'clr-outline';
  return (
    <div className={`flex ${dense ? 'items-center gap-4 ' + dimensions : 'flex-col items-start gap-2'}`}>
      {label && 
      <Label
        text={label}
        htmlFor={id}
      />}
      <textarea id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight ${outlineClass} ${borderClass} ${colors} ${dense ? 'w-full' : dimensions}`}
        rows={rows}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextArea;
