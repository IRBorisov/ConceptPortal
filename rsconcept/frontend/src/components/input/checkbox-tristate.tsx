import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CheckboxChecked, CheckboxNull } from '../icons';

import { type CheckboxProps } from './checkbox';

export interface CheckboxTristateProps extends Omit<CheckboxProps, 'value' | 'onChange'> {
  /** Current value - `null`, `true` or `false`. */
  value: boolean | null;

  /** Callback to set the `value`. */
  onChange?: (newValue: boolean | null) => void;
}

/**
 * Component that allows toggling among three states: `true`, `false`, and `null`.
 */
export function CheckboxTristate({
  disabled,
  label,
  title,
  titleHtml,
  hideTitle,
  className,
  value,
  onChange,
  ...restProps
}: CheckboxTristateProps) {
  const cursor = disabled ? 'cursor-arrow' : onChange ? 'cursor-pointer' : '';

  function handleClick(event: React.MouseEvent<Element>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !onChange) {
      return;
    }
    if (value === false) {
      onChange(null);
    } else if (value === null) {
      onChange(true);
    } else {
      onChange(false);
    }
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
      disabled={disabled}
      onClick={handleClick}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
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
        {value == null ? <CheckboxNull /> : null}
      </div>
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap select-text', cursor)}>{label}</span> : null}
    </button>
  );
}
