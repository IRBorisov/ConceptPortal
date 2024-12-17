import clsx from 'clsx';

import { TokenID } from '@/models/rslang';
import { globals } from '@/utils/constants';
import { describeToken, labelToken } from '@/utils/labels';

interface RSTokenButtonProps {
  token: TokenID;
  disabled?: boolean;
  onInsert: (token: TokenID, key?: string) => void;
}

function RSTokenButton({ token, disabled, onInsert }: RSTokenButtonProps) {
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
        'outline-none',
        'clr-hover clr-text-controls cc-animate-color',
        'font-math',
        'cursor-pointer disabled:cursor-default',
        {
          'w-[3.7rem] md:w-[4.5rem]': label.length > 3,
          'w-[1.85rem] md:w-[2.25rem]': label.length <= 3
        }
      )}
      data-tooltip-id={globals.tooltip}
      data-tooltip-html={describeToken(token)}
    >
      {label ? <span className='whitespace-nowrap'>{label}</span> : null}
    </button>
  );
}

export default RSTokenButton;
