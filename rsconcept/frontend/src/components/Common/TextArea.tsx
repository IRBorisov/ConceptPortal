import clsx from 'clsx';
import { TextareaHTMLAttributes } from 'react';

import { IColorsProps, IEditorProps } from './commonInterfaces';
import Label from './Label';

export interface TextAreaProps 
extends IEditorProps, IColorsProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'title'> {
  dense?: boolean
}

function TextArea({
  id, label, required, tooltip, rows,
  dense, noBorder, noOutline,
  dimensions = 'w-full',
  colors = 'clr-input',
  ...restProps
}: TextAreaProps) {
  return (
  <div className={clsx(
    {
      'flex items-center gap-3': dense,
      'flex flex-col items-start gap-2': !dense
    },
    dense && dimensions,
  )}>
    <Label text={label} htmlFor={id} />
    <textarea id={id}
      title={tooltip}
      className={clsx(
        'px-3 py-2',
        'leading-tight',
        {
          'w-full': dense,
          'border': !noBorder,
          'clr-outline': !noOutline
        },
        colors, 
        !dense && dimensions
      )}
      rows={rows}
      required={required}
      {...restProps}
    />
  </div>);
}

export default TextArea;