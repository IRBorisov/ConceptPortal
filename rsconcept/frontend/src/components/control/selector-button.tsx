import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { type Button } from '../props';

interface SelectorButtonProps extends Button {
  /** Text to display in the button. */
  text?: string;

  /** Icon to display in the button. */
  icon?: React.ReactNode;

  /** Indicates if button background should be transparent. */
  transparent?: boolean;
}

/**
 * Displays a button with an icon and text that opens a dropdown menu.
 */
export function SelectorButton({
  text,
  icon,
  title,
  titleHtml,
  className,
  transparent,
  hideTitle,
  ...restProps
}: SelectorButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      className={clsx(
        'px-1 flex flex-start items-center gap-1',
        'text-sm font-controls select-none',
        'text-btn clr-text-controls',
        'disabled:cursor-auto cursor-pointer',
        'cc-animate-color',
        {
          'clr-hover': transparent,
          'clr-btn-default border': !transparent
        },
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <div className='whitespace-nowrap'>{text}</div> : null}
    </button>
  );
}
