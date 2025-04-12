import { type Editor, type ErrorProcessing, type Titled } from '../props';
import { cn } from '../utils';

import { ErrorField } from './error-field';
import { Label } from './label';

interface TextAreaProps extends Editor, ErrorProcessing, Titled, React.ComponentProps<'textarea'> {
  /** Indicates that the input should be transparent. */
  transparent?: boolean;

  /** Indicates that padding should be minimal. */
  dense?: boolean;

  /** Disable resize when content overflows. */
  noResize?: boolean;

  /** Disable resize to fit content. */
  fitContent?: boolean;
}

/**
 * Displays a customizable textarea with a label.
 */
export function TextArea({
  id,
  label,
  transparent,
  dense,
  noBorder,
  noOutline,
  noResize,
  className,
  fitContent,
  disabled,
  error,
  ...restProps
}: TextAreaProps) {
  return (
    <div
      className={cn(
        'w-full', //
        dense ? 'flex grow items-center gap-3' : 'flex flex-col',
        dense && className
      )}
    >
      <Label text={label} htmlFor={id} />
      <textarea
        id={id}
        className={cn(
          'px-3 py-2',
          'leading-tight',
          'overflow-x-hidden overflow-y-auto',
          !noBorder && 'border',
          fitContent && 'field-sizing-content',
          noResize && 'resize-none',
          transparent || disabled ? 'bg-transparent' : 'bg-input',
          !noOutline && 'focus-outline',
          dense && 'grow max-w-full',
          !dense && !!label && 'mt-2',
          !dense && className
        )}
        disabled={disabled}
        {...restProps}
      />
      <ErrorField className='mt-1' error={error} />
    </div>
  );
}
