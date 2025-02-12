import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CheckboxChecked, CheckboxNull } from '../Icons';
import { CProps } from '../props';

import { CheckboxProps } from './Checkbox';

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

  function handleClick(event: CProps.EventMouse): void {
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
        'outline-none',
        'focus-frame',
        cursor,
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      <div
        className={clsx(
          'w-4 h-4', //
          'pt-[0.05rem] pl-[0.05rem]',
          'border rounded-sm',
          'cc-animate-color',
          {
            'bg-sec-600 text-sec-0': value !== false,
            'bg-prim-100': value === false
          }
        )}
      >
        {value ? <CheckboxChecked /> : null}
        {value == null ? <CheckboxNull /> : null}
      </div>
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap select-text', cursor)}>{label}</span> : null}
    </button>
  );
}
