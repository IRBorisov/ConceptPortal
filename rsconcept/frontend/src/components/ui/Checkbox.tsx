import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CheckboxChecked } from '../Icons';
import { CProps } from '../props';

export interface CheckboxProps extends Omit<CProps.Button, 'value' | 'onClick'> {
  /** Label to display next to the checkbox. */
  label?: string;

  /** Indicates whether the checkbox is disabled. */
  disabled?: boolean;

  /** Current value - `true` or `false`. */
  value: boolean;

  /** Callback to set the `value`. */
  setValue?: (newValue: boolean) => void;
}

/**
 * Component that allows toggling a boolean value.
 */
function Checkbox({
  disabled,
  label,
  title,
  titleHtml,
  hideTitle,
  className,
  value,
  setValue,
  ...restProps
}: CheckboxProps) {
  const cursor = disabled ? 'cursor-arrow' : setValue ? 'cursor-pointer' : '';

  function handleClick(event: CProps.EventMouse): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !setValue) {
      return;
    }
    setValue(!value);
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
          'max-w-[1rem] min-w-[1rem] h-4', //
          'pt-[0.1rem] pl-[0.1rem]',
          'border rounded-sm',
          'cc-animate-color',
          {
            'bg-sec-600 text-sec-0': value !== false,
            'bg-prim-100': value === false
          }
        )}
      >
        {value ? <CheckboxChecked /> : null}
      </div>
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap select-text', cursor)}>{label}</span> : null}
    </button>
  );
}

export default Checkbox;
