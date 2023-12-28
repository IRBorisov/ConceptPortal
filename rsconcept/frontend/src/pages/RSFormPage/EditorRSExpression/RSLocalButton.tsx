import clsx from 'clsx';

import { TokenID } from '@/models/rslang';
import { globalIDs } from '@/utils/constants';

interface RSLocalButtonProps {
  text: string;
  title: string;
  disabled?: boolean;
  onInsert: (token: TokenID, key?: string) => void;
}

function RSLocalButton({ text, title, disabled, onInsert }: RSLocalButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      disabled={disabled}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      className={clsx(
        'w-[2rem] h-6',
        'cursor-pointer disabled:cursor-default',
        'rounded-none',
        'clr-hover clr-btn-clear'
      )}
      onClick={() => onInsert(TokenID.ID_LOCAL, text)}
    >
      {text}
    </button>
  );
}

export default RSLocalButton;
