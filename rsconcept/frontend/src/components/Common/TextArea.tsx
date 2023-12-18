import clsx from 'clsx';
import { TextareaHTMLAttributes } from 'react';

import { IColorsProps, IEditorProps } from './commonInterfaces';
import Label from './Label';

export interface TextAreaProps 
extends IEditorProps, IColorsProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'title'> {
  dense?: boolean
}

function TextArea({
  id, label, required, tooltip, rows,
  dense, noBorder, noOutline,
  className,
  colors = 'clr-input',
  ...restProps
}: TextAreaProps) {
  return (
  <div className={clsx(
    {
      'flex flex-col gap-2': !dense,
      'flex justify-stretch items-center gap-3': dense
    },
    dense && className,
  )}>
    <Label text={label} htmlFor={id} />
    <textarea id={id}
      title={tooltip}
      className={clsx(
        'px-3 py-2',
        'leading-tight',
        {
          'border': !noBorder,
          'flex-grow': dense,
          'clr-outline': !noOutline
        },
        colors, 
        !dense && className
      )}
      rows={rows}
      required={required}
      {...restProps}
    />
  </div>);
}

export default TextArea;