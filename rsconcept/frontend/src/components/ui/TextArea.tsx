import clsx from 'clsx';

import { CProps } from '@/components/props';

import Label from './Label';

export interface TextAreaProps extends CProps.Editor, CProps.Colors, CProps.TextArea {
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
function TextArea({
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
  colors = 'clr-input',
  ...restProps
}: TextAreaProps) {
  return (
    <div
      className={clsx(
        'w-full',
        {
          'flex flex-col gap-2': !dense,
          'flex flex-grow items-center gap-3': dense
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
            'flex-grow max-w-full': dense,
            'clr-outline': !noOutline
          },
          colors,
          !dense && className
        )}
        rows={rows}
        required={required}
        {...restProps}
      />
    </div>
  );
}

export default TextArea;
