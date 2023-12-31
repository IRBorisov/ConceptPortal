import clsx from 'clsx';
import { useMemo } from 'react';

import { globalIDs } from '@/utils/constants';

import { CheckboxCheckedIcon, CheckboxNullIcon } from '../Icons';
import { CheckboxProps } from './Checkbox';

export interface CheckboxTristateProps extends Omit<CheckboxProps, 'value' | 'setValue'> {
  value: boolean | null;
  setValue?: (newValue: boolean | null) => void;
}

function CheckboxTristate({
  id,
  disabled,
  label,
  title,
  className,
  value,
  setValue,
  ...restProps
}: CheckboxTristateProps) {
  const cursor = useMemo(() => {
    if (disabled) {
      return 'cursor-not-allowed';
    } else if (setValue) {
      return 'cursor-pointer';
    } else {
      return '';
    }
  }, [disabled, setValue]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
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
      id={id}
      className={clsx(
        'flex items-center gap-2 text-start', // prettier: split lines
        'outline-none',
        cursor,
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
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
            <CheckboxCheckedIcon />
          </div>
        ) : null}
        {value == null ? (
          <div className='mt-[1px] ml-[1px]'>
            <CheckboxNullIcon />
          </div>
        ) : null}
      </div>
      <label className={clsx('text-sm whitespace-nowrap', cursor)} htmlFor={id}>
        {label}
      </label>
    </button>
  );
}

export default CheckboxTristate;
