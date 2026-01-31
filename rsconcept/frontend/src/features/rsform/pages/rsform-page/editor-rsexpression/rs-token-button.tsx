import clsx from 'clsx';

import { type TokenID } from '@/features/rslang';
import { labelToken } from '@/features/rslang/labels';

import { globalIDs } from '@/utils/constants';

import { describeToken } from '../../../labels';

interface RSTokenButtonProps {
  token: TokenID;
  disabled?: boolean;
  onInsert: (token: TokenID, key?: string) => void;
}

export function RSTokenButton({ token, disabled, onInsert }: RSTokenButtonProps) {
  const label = labelToken(token);
  return (
    <button
      type='button'
      tabIndex={-1}
      onClick={() => onInsert(token)}
      className={clsx(
        'h-5 sm:h-6',
        'px-1 rounded-md',
        'outline-hidden',
        'cc-hover-text cc-hover-pulse text-muted-foreground cc-animate-color',
        'font-math',
        'cursor-pointer disabled:cursor-default',
        label.length > 3 ? 'w-14.5 md:w-18' : 'w-7.25 md:w-9'
      )}
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-html={describeToken(token)}
      disabled={disabled}
    >
      {label ? <span className='whitespace-nowrap'>{label}</span> : null}
    </button>
  );
}
