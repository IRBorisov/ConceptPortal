import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CheckboxChecked } from '../icons';
import { type Button } from '../props';

export interface CheckboxProps extends Omit<Button, 'value' | 'onClick' | 'onChange'> {
  /** Label to display next to the checkbox. */
  label?: string;

  /** Indicates whether the checkbox is disabled. */
  disabled?: boolean;

  /** Current value - `true` or `false`. */
  value?: boolean;

  /** Callback to set the `value`. */
  onChange?: (newValue: boolean) => void;
}

/**
 * Component that allows toggling a boolean value.
 */
export function Checkbox({
  disabled,
  label,
  title,
  titleHtml,
  hideTitle,
  className,
  value,
  onChange,
  ...restProps
}: CheckboxProps) {
  const cursor = disabled ? 'cursor-arrow' : onChange ? 'cursor-pointer' : '';

  function handleClick(event: React.MouseEvent<Element>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !onChange) {
      return;
    }
    onChange(!value);
  }

  return (
    <button
      type='button'
      className={clsx(
        'flex items-center gap-2', //
        'outline-hidden',
        'focus-frame',
        cursor,
        className
      )}
      onClick={handleClick}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      disabled={disabled}
      {...restProps}
    >
      <div
        className={clsx(
          'w-4 h-4', //
          'border rounded-sm',
          value === false ? 'bg-prim-100' : 'bg-sec-600 text-sec-0'
        )}
      >
        {value ? <CheckboxChecked /> : null}
      </div>
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap select-text', cursor)}>{label}</span> : null}
    </button>
  );
}
