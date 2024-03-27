import clsx from 'clsx';

import { CProps } from '@/components/props';
import { TokenID } from '@/models/rslang';
import { globals } from '@/utils/constants';

interface RSLocalButtonProps extends CProps.Titled {
  text: string;
  disabled?: boolean;
  onInsert: (token: TokenID, key?: string) => void;
}

function RSLocalButton({ text, title, titleHtml, hideTitle, disabled, onInsert }: RSLocalButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      disabled={disabled}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      className={clsx(
        'w-[1.7rem] sm:w-[2rem] h-5 sm:h-6',
        'cursor-pointer disabled:cursor-default',
        'rounded-none',
        'clr-hover clr-btn-clear',
        'font-math'
      )}
      onClick={() => onInsert(TokenID.ID_LOCAL, text)}
    >
      {text}
    </button>
  );
}

export default RSLocalButton;
