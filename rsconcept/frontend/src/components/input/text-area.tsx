import clsx from 'clsx';

import { type Editor, type ErrorProcessing, type Titled } from '../props';

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
  required,
  transparent,
  rows,
  dense,
  noBorder,
  noOutline,
  noResize,
  className,
  fitContent,
  error,
  ...restProps
}: TextAreaProps) {
  return (
    <div
      className={clsx(
        'w-full', //
        dense ? 'flex grow items-center gap-3' : 'flex flex-col',
        dense && className
      )}
    >
      <Label text={label} htmlFor={id} />
      <textarea
        id={id}
        className={clsx(
          'px-3 py-2',
          'leading-tight',
          'overflow-x-hidden overflow-y-auto',
          !noBorder && 'border',
          fitContent && 'field-sizing-content',
          noResize && 'resize-none',
          transparent ? 'bg-transparent' : 'clr-input',
          !noOutline && 'clr-outline',
          dense && 'grow max-w-full',
          !dense && !!label && 'mt-2',
          !dense && className
        )}
        rows={rows}
        required={required}
        {...restProps}
      />
      <ErrorField className='mt-1' error={error} />
    </div>
  );
}
