import clsx from 'clsx';
import { useMemo } from 'react';

import { globalIDs } from '@/utils/constants';

import { CheckboxCheckedIcon } from '../Icons';
import { CProps } from '../props';
import Label from './Label';

export interface CheckboxProps extends Omit<CProps.Button, 'value' | 'onClick'> {
  label?: string;
  disabled?: boolean;

  value: boolean;
  setValue?: (newValue: boolean) => void;
}

function Checkbox({ id, disabled, label, title, className, value, setValue, ...restProps }: CheckboxProps) {
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
    setValue(!value);
  }

  return (
    <button
      type='button'
      id={id}
      className={clsx('flex items-center gap-2', 'outline-none', 'text-start', cursor, className)}
      disabled={disabled}
      onClick={handleClick}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      {...restProps}
    >
      <div
        className={clsx('max-w-[1rem] min-w-[1rem] h-4', 'border rounded-sm', {
          'clr-primary': value !== false,
          'clr-app': value === false
        })}
      >
        {value ? (
          <div className='mt-[1px] ml-[1px]'>
            <CheckboxCheckedIcon />
          </div>
        ) : null}
      </div>
      <Label className={cursor} text={label} htmlFor={id} />
    </button>
  );
}

export default Checkbox;
