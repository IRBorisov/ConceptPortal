import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CheckboxChecked, CheckboxNull } from '../Icons';
import { CProps } from '../props';
import { CheckboxProps } from './Checkbox';

export interface CheckboxTristateProps extends Omit<CheckboxProps, 'value' | 'setValue'> {
  /** Current value - `null`, `true` or `false`. */
  value: boolean | null;

  /** Callback to set the `value`. */
  setValue?: (newValue: boolean | null) => void;
}

/**
 * Component that allows toggling among three states: `true`, `false`, and `null`.
 */
function CheckboxTristate({
  disabled,
  label,
  title,
  titleHtml,
  hideTitle,
  className,
  value,
  setValue,
  ...restProps
}: CheckboxTristateProps) {
  const cursor = disabled ? 'cursor-arrow' : setValue ? 'cursor-pointer' : '';

  function handleClick(event: CProps.EventMouse): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !setValue) {
      return;
    }
    if (value === false) {
      setValue(null);
    } else if (value === null) {
      setValue(true);
    } else {
      setValue(false);
    }
  }

  return (
    <button
      type='button'
      className={clsx(
        'flex items-center gap-2', // prettier: split lines
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
          'w-4 h-4', // prettier: split lines
          'border rounded-sm',
          'cc-animate-color',
          {
            'bg-sec-600 text-sec-0': value !== false,
            'bg-prim-100': value === false
          }
        )}
      >
        {value ? (
          <div className='mt-[1px] ml-[1px]'>
            <CheckboxChecked />
          </div>
        ) : null}
        {value == null ? (
          <div className='mt-[1px] ml-[1px]'>
            <CheckboxNull />
          </div>
        ) : null}
      </div>
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap select-text', cursor)}>{label}</span> : null}
    </button>
  );
}

export default CheckboxTristate;
