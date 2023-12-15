import clsx from 'clsx';

import { IColorsProps, IEditorProps } from './commonInterfaces';
import Label from './Label';

interface TextInputProps 
extends IEditorProps, IColorsProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title'> {
  dense?: boolean
  allowEnter?: boolean
}

function preventEnterCapture(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}

function TextInput({
  id, label, dense, tooltip, noBorder, noOutline, allowEnter, disabled,
  dimensions = 'w-full',
  colors = 'clr-input',
  onKeyDown,
  ...restProps
}: TextInputProps) {
  return (
  <div className={clsx(
    {
      'flex flex-col items-start gap-2': !dense,
      'flex items-center gap-3': dense,
    },
    dense && dimensions
  )}>
    <Label text={label} htmlFor={id} />
    <input id={id}
      title={tooltip}
      className={clsx(
        'py-2',
        'leading-tight truncate hover:text-clip',
        {
          'px-3': !noBorder || !disabled,
          'w-full': dense,
          'border': !noBorder,
          'clr-outline': !noOutline
        },
        colors, 
        !dense && dimensions
      )}
      onKeyDown={!allowEnter && !onKeyDown ? preventEnterCapture : onKeyDown}
      disabled={disabled}
      {...restProps}
    />
  </div>);
}

export default TextInput;