import clsx from 'clsx';

import { Label } from './label';
import { type Editor, type ErrorProcessing, type Titled } from '../props';

import { ErrorField } from './error-field';

interface TextInputProps extends Editor, ErrorProcessing, Titled, React.ComponentProps<'input'> {
  /** Indicates that the input should be transparent. */
  transparent?: boolean;

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
  transparent,
  className,
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
            'clr-outline': !noOutline,
            'bg-transparent': transparent,
            'clr-input': !transparent
          },
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
