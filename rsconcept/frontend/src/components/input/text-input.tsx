import clsx from 'clsx';

import { type Editor, type ErrorProcessing, type Titled } from '../props';
import { cn } from '../utils';

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
  if (dense) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className='flex items-center gap-3'>
          <Label text={label} htmlFor={id} />
          <input
            id={id}
            className={clsx(
              'h-9 min-w-0 grow max-w-full',
              'leading-tight truncate hover:text-clip',
              transparent || disabled ? 'bg-transparent' : 'bg-input',
              !noBorder && 'border',
              !noOutline && 'focus-outline',
              (!noBorder || !disabled) && 'px-3'
            )}
            onKeyDown={!allowEnter && !onKeyDown ? preventEnterCapture : onKeyDown}
            disabled={disabled}
            {...restProps}
          />
        </div>
        <ErrorField className='mt-1' error={error} />
      </div>
    );
  } else {
    return (
      <div className={cn('flex flex-col', className)}>
        <Label text={label} htmlFor={id} />
        <input
          id={id}
          className={clsx(
            'h-9 min-w-0',
            'leading-tight truncate hover:text-clip',
            transparent || disabled ? 'bg-transparent' : 'bg-input',
            !noBorder && 'border py-2',
            !noOutline && 'focus-outline',
            (!noBorder || !disabled) && 'px-3',
            !!label && 'mt-2'
          )}
          onKeyDown={!allowEnter && !onKeyDown ? preventEnterCapture : onKeyDown}
          disabled={disabled}
          {...restProps}
        />
        <ErrorField className='mt-1' error={error} />
      </div>
    );
  }
}
