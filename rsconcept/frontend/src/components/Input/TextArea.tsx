import clsx from 'clsx';

import { Label } from '../Input/Label';
import { type Colors, type Editor, type ErrorProcessing, type TextArea as TextAreaStyle } from '../props';

import { ErrorField } from './ErrorField';

export interface TextAreaProps extends Editor, ErrorProcessing, Colors, TextAreaStyle {
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
  rows,
  dense,
  noBorder,
  noOutline,
  noResize,
  className,
  fitContent,
  error,
  colors = 'clr-input',
  ...restProps
}: TextAreaProps) {
  return (
    <div
      className={clsx(
        'w-full',
        {
          'flex flex-col': !dense,
          'flex grow items-center gap-3': dense
        },
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
          {
            'cc-fit-content': fitContent,
            'resize-none': noResize,
            'border': !noBorder,
            'grow max-w-full': dense,
            'mt-2': !dense && !!label,
            'clr-outline': !noOutline
          },
          colors,
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
