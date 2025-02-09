import clsx from 'clsx';

import { CProps } from '@/components/props';
import { globals } from '@/utils/constants';

import { TokenID } from '../../../models/rslang';

interface RSLocalButtonProps extends CProps.Titled, CProps.Styling {
  text: string;
  disabled?: boolean;
  onInsert: (token: TokenID, key?: string) => void;
}

function RSLocalButton({
  text,
  title,
  titleHtml,
  hideTitle,
  disabled,
  className,
  onInsert,
  ...restProps
}: RSLocalButtonProps) {
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
        'clr-hover clr-text-controls cc-animate-color',
        'font-math',
        className
      )}
      onClick={() => onInsert(TokenID.ID_LOCAL, text)}
      {...restProps}
    >
      {text}
    </button>
  );
}

export default RSLocalButton;
