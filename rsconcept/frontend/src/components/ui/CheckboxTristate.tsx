import clsx from 'clsx';
import { useMemo } from 'react';

import { globals } from '@/utils/constants';

import { CheckboxChecked, CheckboxNull } from '../Icons';
import { CProps } from '../props';
import { CheckboxProps } from './Checkbox';

export interface CheckboxTristateProps extends Omit<CheckboxProps, 'value' | 'setValue'> {
  value: boolean | null;
  setValue?: (newValue: boolean | null) => void;
}

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
  const cursor = useMemo(() => {
    if (disabled) {
      return 'cursor-arrow';
    } else if (setValue) {
      return 'cursor-pointer';
    } else {
      return '';
    }
  }, [disabled, setValue]);

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
          {
            'clr-primary': value !== false,
            'clr-app': value === false
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
