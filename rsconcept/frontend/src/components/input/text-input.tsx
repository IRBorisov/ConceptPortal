import clsx from 'clsx';

import { type Editor, type ErrorProcessing, type Titled } from '../props';

import { ErrorField } from './error-field';
import { Label } from './label';

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
        dense ? 'flex items-center gap-3' : 'flex flex-col', //
        dense && className
      )}
    >
      <Label text={label} htmlFor={id} />
      <input
        id={id}
        className={clsx(
          'min-w-0 py-2',
          'leading-tight truncate hover:text-clip',
          transparent ? 'bg-transparent' : 'clr-input',
          !noBorder && 'border',
          !noOutline && 'clr-outline',
          (!noBorder || !disabled) && 'px-3',
          dense && 'grow max-w-full',
          !dense && !!label && 'mt-2',
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
