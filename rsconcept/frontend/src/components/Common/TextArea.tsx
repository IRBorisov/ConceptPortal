import clsx from 'clsx';

import { CProps } from '../props';
import Label from './Label';

export interface TextAreaProps 
extends CProps.Editor, CProps.Colors, CProps.TextArea {
  dense?: boolean
}

function TextArea({
  id, label, required, rows,
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