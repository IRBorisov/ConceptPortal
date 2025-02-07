import clsx from 'clsx';

import { Checkbox, CheckboxProps } from '../Input';

/** Animated {@link Checkbox} inside a {@link Dropdown} item. */
export function DropdownCheckbox({ onChange: setValue, disabled, ...restProps }: CheckboxProps) {
  return (
    <div
      className={clsx(
        'px-3 py-1',
        'text-left overflow-ellipsis whitespace-nowrap',
        'disabled:clr-text-controls cc-animate-color',
        !!setValue && !disabled && 'clr-hover'
      )}
    >
      <Checkbox tabIndex={-1} disabled={disabled} onChange={setValue} {...restProps} />
    </div>
  );
}
