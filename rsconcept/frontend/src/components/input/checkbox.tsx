import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CheckboxChecked } from '../icons';
import { type Button } from '../props';
import { cn } from '../utils';

export interface CheckboxProps extends Omit<Button, 'value' | 'onClick' | 'onChange'> {
  /** Label to display next to the checkbox. */
  label?: string;

  /** Indicates whether the checkbox is disabled. */
  disabled?: boolean;

  /** Current value - `true` or `false`. */
  value: boolean;

  /** Callback to set the `value`. */
  onChange?: (newValue: boolean) => void;

  /** Custom icon to display next instead of checkbox. */
  customIcon?: (checked?: boolean) => React.ReactNode;
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
  customIcon,
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
      className={cn(
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
      {customIcon ? (
        customIcon(value)
      ) : (
        <div
          className={clsx(
            'w-4 h-4', //
            'border rounded-sm',
            value === false ? 'bg-background text-foreground' : 'bg-primary text-primary-foreground'
          )}
        >
          {value ? <CheckboxChecked /> : null}
        </div>
      )}
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap select-text', cursor)}>{label}</span> : null}
    </button>
  );
}
