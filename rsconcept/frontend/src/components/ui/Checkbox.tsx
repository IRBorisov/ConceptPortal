import clsx from 'clsx';
import { useMemo } from 'react';

import { globalIDs } from '@/utils/constants';

import { CheckboxCheckedIcon } from '../Icons';
import { CProps } from '../props';

export interface CheckboxProps extends Omit<CProps.Button, 'value' | 'onClick'> {
  label?: string;
  disabled?: boolean;

  value: boolean;
  setValue?: (newValue: boolean) => void;
}

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
      className={clsx(
        'flex items-center gap-2', // prettier: split lines
        'outline-none',
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
          'max-w-[1rem] min-w-[1rem] h-4', // prettier: split lines
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
      </div>
      {label ? <span className={clsx('text-start text-sm whitespace-nowrap', cursor)}>{label}</span> : null}
    </button>
  );
}

export default Checkbox;
