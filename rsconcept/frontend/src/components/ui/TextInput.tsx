import clsx from 'clsx';

import { CProps } from '../props';
import Label from './Label';

interface TextInputProps extends CProps.Editor, CProps.Colors, CProps.Input {
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
function TextInput({
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
  ...restProps
}: TextInputProps) {
  return (
    <div
      className={clsx(
        {
          'flex flex-col gap-2': !dense,
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
            'flex-grow max-w-full': dense,
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
    </div>
  );
}

export default TextInput;
