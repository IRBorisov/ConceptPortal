import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { type TokenID } from '../../../backend/types';
import { describeToken, labelToken } from '../../../labels';

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
      disabled={disabled}
      onClick={() => onInsert(token)}
      className={clsx(
        'h-5 sm:h-6',
        'px-1',
        'outline-hidden',
        'clr-hover clr-text-controls cc-animate-color',
        'font-math',
        'cursor-pointer disabled:cursor-default',
        label.length > 3 ? 'w-14.5 md:w-18' : 'w-7.25 md:w-9'
      )}
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-html={describeToken(token)}
    >
      {label ? <span className='whitespace-nowrap'>{label}</span> : null}
    </button>
  );
}
