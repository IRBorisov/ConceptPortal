import clsx from 'clsx';

import { type Styling, type Titled } from '@/components/props';
import { globalIDs } from '@/utils/constants';

import { TokenID } from '../../../backend/types';

interface RSLocalButtonProps extends Titled, Styling {
  text: string;
  disabled?: boolean;
  onInsert: (token: TokenID, key?: string) => void;
}

export function RSLocalButton({
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
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      className={clsx(
        'w-7 sm:w-8 h-5 sm:h-6',
        'cursor-pointer disabled:cursor-default',
        'rounded-none',
        'cc-hover cc-controls cc-animate-color',
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
