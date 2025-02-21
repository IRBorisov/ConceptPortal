import clsx from 'clsx';

import { Label } from '../Input/Label';
import { type Colors, type Editor, type ErrorProcessing, type Input } from '../props';

import { ErrorField } from './ErrorField';

interface TextInputProps extends Editor, ErrorProcessing, Colors, Input {
  /** Indicates that padding should be minimal. */
  dense?: boolean;

  /** Capture enter key. */
  allowEnter?: boolean;
}

function preventEnterCapture(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}

/**
 * Displays a customizable input with a label.
 */
export function TextInput({
  id,
  label,
  dense,
  noBorder,
  noOutline,
  allowEnter,
  disabled,
  className,
  colors = 'clr-input',
  onKeyDown,
  error,
  ...restProps
}: TextInputProps) {
  return (
    <div
      className={clsx(
        {
          'flex flex-col': !dense,
          'flex items-center gap-3': dense
        },
        dense && className
      )}
    >
      <Label text={label} htmlFor={id} />
      <input
        id={id}
        className={clsx(
          'min-w-0 py-2',
          'leading-tight truncate hover:text-clip',
          {
            'px-3': !noBorder || !disabled,
            'grow max-w-full': dense,
            'mt-2': !dense && !!label,
            'border': !noBorder,
            'clr-outline': !noOutline
          },
          colors,
          !dense && className
        )}
        onKeyDown={!allowEnter && !onKeyDown ? preventEnterCapture : onKeyDown}
        disabled={disabled}
        {...restProps}
      />
      <ErrorField className='mt-1' error={error} />
    </div>
  );
}
